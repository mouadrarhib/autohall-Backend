-- AppParameter audit on insert/delete (update already handled elsewhere)
CREATE   TRIGGER dbo.trg_AppParameter_Audit_IUD
ON dbo.AppParameter
AFTER INSERT, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog ([timestamp], module, objectId, [action], message, machineIp)
  SELECT SYSUTCDATETIME(), 'AppParameter', i.id, 'Inserted',
         CONCAT('Key=', i.[key]), HOST_NAME()
  FROM inserted i
  UNION ALL
  SELECT SYSUTCDATETIME(), 'AppParameter', d.id, 'Deleted',
         CONCAT('Key=', d.[key]), HOST_NAME()
  FROM deleted d;
END;

CREATE   TRIGGER dbo.trg_AppParameter_ProtectKeyAndStamp
ON dbo.AppParameter
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  -- Block key changes
  IF UPDATE([key])
  BEGIN
    RAISERROR('AppParameter.[key] cannot be modified.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END

  -- Stamp updatedAt once per statement using a session flag
  IF TRY_CONVERT(int, SESSION_CONTEXT(N'appparam_upd')) = 1 RETURN;
  EXEC sys.sp_set_session_context @key=N'appparam_upd', @value=1;

  UPDATE p
    SET updatedAt = SYSUTCDATETIME()
  FROM dbo.AppParameter p
  JOIN inserted i ON i.id = p.id;

  EXEC sys.sp_set_session_context @key=N'appparam_upd', @value=0;
END;

-- Filiale audit for insert/update
CREATE   TRIGGER dbo.trg_Filiale_Audit_IU
ON dbo.Filiale
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog([timestamp], module, objectId, [action], message, machineIp)
  SELECT SYSUTCDATETIME(), 'Filiale', i.id,
         CASE WHEN d.id IS NULL THEN 'Inserted' ELSE 'Updated' END,
         CONCAT('name=', i.name, ', active=', CONVERT(varchar(10), i.active)),
         HOST_NAME()
  FROM inserted i
  LEFT JOIN deleted d ON d.id = i.id;
END;

CREATE   TRIGGER dbo.trg_Filiale_SoftDelete
ON dbo.Filiale
INSTEAD OF DELETE
AS
BEGIN
  SET NOCOUNT ON;

  -- Soft-deactivate the selected Filiales
  UPDATE f
    SET f.active = 0
  FROM dbo.Filiale f
  JOIN deleted d ON d.id = f.id;

  -- Cascade deactivate Marque, Modele, Version under those Filiales
  UPDATE m SET m.active = 0
  FROM dbo.Marque m
  JOIN deleted d ON d.id = m.idFiliale;

  UPDATE mo SET mo.active = 0
  FROM dbo.Modele mo
  JOIN dbo.Marque m ON m.id = mo.idMarque
  JOIN deleted d ON d.id = m.idFiliale;

  UPDATE v SET v.active = 0
  FROM dbo.[Version] v
  JOIN dbo.Modele mo ON mo.id = v.idModele
  JOIN dbo.Marque m ON m.id = mo.idMarque
  JOIN deleted d ON d.id = m.idFiliale;

  -- Optional audit
  INSERT INTO dbo.AuditLog([timestamp], module, objectId, [action], machineIp, message)
  SELECT SYSUTCDATETIME(), 'Filiale', d.id, 'SoftDelete', HOST_NAME(), 'Soft-deactivated via INSTEAD OF DELETE'
  FROM deleted d;
END;

CREATE TRIGGER trg_Marque_CascadeDeactivate
ON dbo.Marque
AFTER UPDATE
AS
BEGIN
  IF EXISTS (
    SELECT 1 FROM inserted WHERE active = 0
  )
  BEGIN
    UPDATE mo SET mo.active = 0
    FROM dbo.Modele mo
    INNER JOIN inserted i ON mo.idMarque = i.id;
    UPDATE v SET v.active = 0
    FROM dbo.Version v
    INNER JOIN dbo.Modele mo ON v.idModele = mo.id
    INNER JOIN inserted i ON mo.idMarque = i.id;
  END
END;

-- Auto-activate parents when Modele is activated
CREATE   TRIGGER dbo.trg_Modele_AutoActivateParents
ON dbo.Modele
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  -- Only rows being activated
  UPDATE m
    SET m.active = 1
  FROM inserted i
  JOIN dbo.Marque m ON m.id = i.idMarque
  WHERE i.active = 1 AND m.active = 0;

  UPDATE f
    SET f.active = 1
  FROM inserted i
  JOIN dbo.Marque m ON m.id = i.idMarque
  JOIN dbo.Filiale f ON f.id = m.idFiliale
  WHERE i.active = 1 AND f.active = 0;
END;

CREATE   TRIGGER dbo.trg_Modele_BlockActivateWhenMarqueInactive
ON dbo.Modele
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Marque m ON m.id = i.idMarque
    WHERE i.active = 1 AND m.active = 0
  )
  BEGIN
    RAISERROR('Cannot activate Modele under an inactive Marque.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;

-- Block inserting Modele under inactive Marque
CREATE   TRIGGER dbo.trg_Modele_BlockInsertWhenMarqueInactive
ON dbo.Modele
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Marque m ON m.id = i.idMarque
    WHERE m.active = 0
  )
  BEGIN
    RAISERROR('Cannot insert Modele under an inactive Marque.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;

-- Prevent duplicate active Modele names per Marque (case-insensitive collation assumed)
CREATE   TRIGGER dbo.trg_Modele_NoDuplicateNamePerMarque
ON dbo.Modele
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Modele mo
      ON mo.idMarque = i.idMarque
     AND mo.name = i.name
     AND mo.active = 1
    GROUP BY i.idMarque, i.name
    HAVING COUNT(*) > 1
  )
  BEGIN
    RAISERROR('Duplicate active Modele name within the same Marque.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;

CREATE TRIGGER trg_Permission_Audit
ON dbo.Permission
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog([timestamp], module, objectId, [scope], userId, message, [action], machineIp, description)
  SELECT
    sysutcdatetime(),
    'Permission',
    COALESCE(i.id, d.id),
    NULL,
    NULL,
    CONCAT('Permission ', CASE WHEN EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted) THEN 'Inserted'
                              WHEN EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted) THEN 'Updated'
                              ELSE 'Deleted' END, ': ', COALESCE(i.name, d.name)),
    'TRIGGER',
    '127.0.0.1',
    'Permission table modification detected.'
  FROM inserted i
  FULL JOIN deleted d ON i.id = d.id;
END;

CREATE   TRIGGER dbo.trg_Permission_NormalizeName
ON dbo.Permission
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE p
    SET p.name = LTRIM(RTRIM(p.name))
  FROM dbo.Permission p
  JOIN inserted i ON i.id = p.id
  WHERE p.name <> LTRIM(RTRIM(p.name));
END;

CREATE TRIGGER trg_PreventActiveUserDelete
ON dbo.[User]
INSTEAD OF DELETE
AS
BEGIN
  IF EXISTS (
    SELECT 1 FROM deleted WHERE active = 1
  )
  BEGIN
    RAISERROR('Cannot delete active users.', 16, 1);
    RETURN;
  END
  ELSE
  BEGIN
    DELETE FROM dbo.[User] WHERE id IN (SELECT id FROM deleted);
  END
END;

CREATE TRIGGER trg_Role_Audit
ON dbo.[Role]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog([timestamp], module, objectId, [scope], userId, message, [action], machineIp, description)
  SELECT
    sysutcdatetime(),
    'Role',
    COALESCE(i.id, d.id),
    NULL,
    NULL,
    CONCAT('Role ', CASE WHEN EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted) THEN 'Inserted'
                        WHEN EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted) THEN 'Updated'
                        ELSE 'Deleted' END, ': ', COALESCE(i.name, d.name)),
    'TRIGGER',
    '127.0.0.1',
    'Role table modification detected.'
  FROM inserted i
  FULL JOIN deleted d ON i.id = d.id;
END;

-- Normalize Role and Permission names (trim) to reduce whitespace dupes
CREATE   TRIGGER dbo.trg_Role_NormalizeName
ON dbo.[Role]
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE r
    SET r.name = LTRIM(RTRIM(r.name))
  FROM dbo.[Role] r
  JOIN inserted i ON i.id = r.id
  WHERE r.name <> LTRIM(RTRIM(r.name));
END;

CREATE TRIGGER trg_User_Audit
ON dbo.[User]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.AuditLog (
    [timestamp], module, objectId, [scope], userId, message, [action], machineIp, description
  )
  SELECT
    sysutcdatetime(),
    'User',
    COALESCE(i.id, d.id),
    NULL,
    COALESCE(i.username, d.username),
    CASE
      WHEN EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted) THEN 'Inserted'
      WHEN EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted) THEN 'Updated'
      ELSE 'Deleted'
    END,
    'TRIGGER',
    '127.0.0.1',
    'User row modification detected by trigger.'
  FROM
    inserted i
    FULL JOIN deleted d ON i.id = d.id;
END;

CREATE   TRIGGER dbo.trg_User_NormalizeIdentity
ON dbo.[User]
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF TRY_CONVERT(int, SESSION_CONTEXT(N'user_norm')) = 1 RETURN;
  EXEC sys.sp_set_session_context @key=N'user_norm', @value=1;

  UPDATE u
    SET email = LOWER(LTRIM(RTRIM(u.email))),
        username = LTRIM(RTRIM(u.username))
  FROM dbo.[User] u
  JOIN inserted i ON i.id = u.id
  WHERE (u.email <> LOWER(LTRIM(RTRIM(u.email))))
     OR (u.username <> LTRIM(RTRIM(u.username)));

  EXEC sys.sp_set_session_context @key=N'user_norm', @value=0;
END;

-- 2) Replace the SetUpdatedAt trigger with a guarded version
CREATE   TRIGGER dbo.trg_User_SetUpdatedAt
ON dbo.[User]
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  -- If this UPDATE was caused by the trigger itself, stop here
  IF UPDATE(updatedAt)
    RETURN;

  -- Session guard (mirrors your other triggers' pattern)
  IF TRY_CONVERT(int, SESSION_CONTEXT(N'user_setupdatedat')) = 1
    RETURN;

  EXEC sys.sp_set_session_context @key = N'user_setupdatedat', @value = 1;

  -- Stamp updatedAt for the affected rows
  UPDATE u
    SET updatedAt = SYSUTCDATETIME()
  FROM dbo.[User] AS u
  JOIN inserted AS i ON i.id = u.id;

  EXEC sys.sp_set_session_context @key = N'user_setupdatedat', @value = 0;
END;

-- Keep [User].active in sync with [User].actif if provided
CREATE   TRIGGER dbo.trg_User_SyncActifActive
ON dbo.[User]
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF TRY_CONVERT(int, SESSION_CONTEXT(N'user_sync')) = 1 RETURN;
  EXEC sys.sp_set_session_context @key=N'user_sync', @value=1;

  UPDATE u
    SET u.active = COALESCE(u.actif, u.active)
  FROM dbo.[User] u
  JOIN inserted i ON i.id = u.id
  WHERE u.active <> COALESCE(u.actif, u.active);

  EXEC sys.sp_set_session_context @key=N'user_sync', @value=0;
END;

CREATE TRIGGER trg_UserPermission_ActiveCheck
ON dbo.UserPermission
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Permission p ON i.idPermission = p.id
    WHERE p.active = 0
  )
  BEGIN
    RAISERROR('Cannot assign inactive permission to user.', 16, 1);
    ROLLBACK TRANSACTION;
  END
END;

CREATE   TRIGGER dbo.trg_UserPermission_Integrity
ON dbo.UserPermission
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Permission p ON p.id = i.idPermission
    WHERE p.active = 0
  )
  BEGIN
    RAISERROR('Cannot assign inactive permission.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END

  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.[User] u ON u.id = i.idUser
    WHERE u.active = 0
  )
  BEGIN
    RAISERROR('Cannot assign permissions to inactive user.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;

CREATE   TRIGGER dbo.trg_UserRole_Audit
ON dbo.UserRole
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @host SYSNAME = HOST_NAME();
  DECLARE @login SYSNAME = SUSER_SNAME();
  DECLARE @client_ip VARCHAR(64) = TRY_CONVERT(VARCHAR(64), SESSION_CONTEXT(N'client_ip'));

  INSERT INTO dbo.AuditLog([timestamp], module, objectId, [scope], userId, [action], machineIp, message, description)
  SELECT SYSUTCDATETIME(), 'UserRole', COALESCE(i.idUser, d.idUser), CAST(COALESCE(i.idRole, d.idRole) AS VARCHAR(100)),
         @login,
         CASE WHEN i.idUser IS NOT NULL AND d.idUser IS NULL THEN 'Assigned'
              WHEN i.idUser IS NOT NULL AND d.idUser IS NOT NULL THEN 'Updated'
              ELSE 'Removed' END,
         COALESCE(@client_ip, @host),
         'UserRole link changed',
         CONCAT('user=', COALESCE(i.idUser, d.idUser), ', role=', COALESCE(i.idRole, d.idRole))
  FROM inserted i
  FULL JOIN deleted d
    ON i.idUser = d.idUser AND i.idRole = d.idRole;
END;

CREATE   TRIGGER dbo.trg_UserRole_Integrity
ON dbo.UserRole
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.[User] u ON u.id = i.idUser
    WHERE u.active = 0
  )
  BEGIN
    RAISERROR('Cannot assign a role to an inactive user.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END

  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.[Role] r ON r.id = i.idRole
    WHERE r.active = 0
  )
  BEGIN
    RAISERROR('Cannot assign an inactive role.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;

CREATE TRIGGER trg_UserRole_NoDuplicate
ON dbo.UserRole
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT i.idUser, i.idRole
    FROM inserted i
    JOIN dbo.UserRole ur
      ON ur.idUser = i.idUser AND ur.idRole = i.idRole
    WHERE ur.active = 1
    GROUP BY i.idUser, i.idRole
    HAVING COUNT(*) > 1
  )
  BEGIN
    RAISERROR('Duplicate active UserRole assignment detected.', 16, 1);
    ROLLBACK TRANSACTION;
  END
END;

-- Prevent duplicate active UserSite rows for the same (idGroupement, idSite)
CREATE   TRIGGER dbo.trg_UserSite_NoDuplicateActive
ON dbo.UserSite
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.UserSite us
      ON us.idGroupement = i.idGroupement
     AND us.idSite       = i.idSite
     AND us.active       = 1
    GROUP BY i.idGroupement, i.idSite
    HAVING COUNT(*) > 1
  )
  BEGIN
    RAISERROR('Duplicate active UserSite for the same groupement/site.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;

CREATE   TRIGGER dbo.trg_UserSite_SiteTypeValidation
ON dbo.UserSite
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  -- Filiale implied but idSite not in Filiale
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Groupement g ON g.id = i.idGroupement
    WHERE CHARINDEX('filiale', LOWER(g.name)) > 0
      AND NOT EXISTS (SELECT 1 FROM dbo.Filiale f WHERE f.id = i.idSite)
  )
  BEGIN
    RAISERROR('UserSite.idSite must refer to Filiale when Groupement implies filiale.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END

  -- Succursale implied but idSite not in Succursale
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Groupement g ON g.id = i.idGroupement
    WHERE CHARINDEX('succursale', LOWER(g.name)) > 0
      AND NOT EXISTS (SELECT 1 FROM dbo.Succursale s WHERE s.id = i.idSite)
  )
  BEGIN
    RAISERROR('UserSite.idSite must refer to Succursale when Groupement implies succursale.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;

-- Auto-activate parents when Version is activated
CREATE   TRIGGER dbo.trg_Version_AutoActivateParents
ON dbo.[Version]
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE mo SET mo.active = 1
  FROM inserted i
  JOIN dbo.Modele mo ON mo.id = i.idModele
  WHERE i.active = 1 AND mo.active = 0;

  UPDATE m SET m.active = 1
  FROM inserted i
  JOIN dbo.Modele mo ON mo.id = i.idModele
  JOIN dbo.Marque m ON m.id = mo.idMarque
  WHERE i.active = 1 AND m.active = 0;

  UPDATE f SET f.active = 1
  FROM inserted i
  JOIN dbo.Modele mo ON mo.id = i.idModele
  JOIN dbo.Marque m ON m.id = mo.idMarque
  JOIN dbo.Filiale f ON f.id = m.idFiliale
  WHERE i.active = 1 AND f.active = 0;
END;

CREATE   TRIGGER dbo.trg_Version_BlockActivateWhenModeleInactive
ON dbo.[Version]
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Modele mo ON mo.id = i.idModele
    WHERE i.active = 1 AND mo.active = 0
  )
  BEGIN
    RAISERROR('Cannot activate Version under an inactive Modele.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;

-- Block inserting Version under inactive Modele
CREATE   TRIGGER dbo.trg_Version_BlockInsertWhenModeleInactive
ON dbo.[Version]
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.Modele mo ON mo.id = i.idModele
    WHERE mo.active = 0
  )
  BEGIN
    RAISERROR('Cannot insert Version under an inactive Modele.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;

-- Prevent duplicate active Version names per Modele
CREATE   TRIGGER dbo.trg_Version_NoDuplicateNamePerModele
ON dbo.[Version]
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN dbo.[Version] v
      ON v.idModele = i.idModele
     AND v.name = i.name
     AND v.active = 1
    GROUP BY i.idModele, i.name
    HAVING COUNT(*) > 1
  )
  BEGIN
    RAISERROR('Duplicate active Version name within the same Modele.', 16, 1);
    ROLLBACK TRANSACTION; RETURN;
  END
END;
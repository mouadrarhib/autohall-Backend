-- dbo.V_Objectif source

CREATE VIEW dbo.V_Objectif
AS
SELECT
  o.id                                   AS id,
  o.groupementId                          AS groupementID,
  g.name                                  AS groupementName,
  o.siteId                                AS SiteID,
  CASE
    WHEN LOWER(g.name) = 'filiale'    THEN f.name
    WHEN LOWER(g.name) = 'succursale' THEN s.name
    ELSE NULL
  END                                     AS SiteName,
  o.periodeId                             AS periodeID,
  tp.name                                 AS periodeTypeName,
  CONVERT(char(10), p.startedDate, 23)
    + ' - ' +
  CONVERT(char(10), p.endDate, 23)        AS periodeName,
  o.typeVenteId                           AS typeVenteID,
  tv.name                                 AS typeVenteName,
  o.typeObjectifId                        AS typeObjectifId,
  tobj.name                               AS typeObjectifName,
  o.marqueId                              AS marqueID,
  m.name                                  AS marqueName,
  o.modeleId                              AS modeleID,
  mo.name                                 AS modeleName,
  o.versionId                             AS versionID,
  v.name                                  AS versionName,
  o.volume                                AS volume,
  o.SalePrice                             AS price,
  CAST(
    CASE WHEN LOWER(tv.name) = 'intergroupe'
         THEN o.MargeInterGroupe
         ELSE o.TMDirect
    END
    AS decimal(9,4)
  )                                       AS TauxMarge,
  CAST(o.volume AS decimal(18,2)) * o.SalePrice
                                          AS ChiffreDaffaire,
  (CAST(o.volume AS decimal(18,2)) * o.SalePrice) *
  CAST(
    CASE WHEN LOWER(tv.name) = 'intergroupe'
         THEN o.MargeInterGroupe
         ELSE o.TMDirect
    END
    AS decimal(9,4)
  )                                       AS Marge,
  o.userId                                AS createdUserId,
  u.full_name                             AS createdUserFullName,
  o.createdAt                             AS CreatedAt,
  o.updatedUserId                         AS updatedUserId,
  u2.full_name                            AS updatedUserFullName,
  o.updatedAt                             AS updatedCreatedAt
FROM dbo.Objectif       AS o
JOIN dbo.Groupement     AS g   ON g.id = o.groupementId
LEFT JOIN dbo.Filiale   AS f   ON f.id = o.siteId AND LOWER(g.name) = 'filiale'
LEFT JOIN dbo.Succursale AS s  ON s.id = o.siteId AND LOWER(g.name) = 'succursale'
JOIN dbo.Periode        AS p   ON p.id = o.periodeId
JOIN dbo.TypePeriode    AS tp  ON tp.id = p.typePeriodeId
JOIN dbo.TypeVente      AS tv  ON tv.id = o.typeVenteId
JOIN dbo.TypeObjectif   AS tobj ON tobj.id = o.typeObjectifId
LEFT JOIN dbo.Marque    AS m   ON m.id = o.marqueId
LEFT JOIN dbo.Modele    AS mo  ON mo.id = o.modeleId
LEFT JOIN dbo.Version   AS v   ON v.id = o.versionId
JOIN dbo.[User]         AS u   ON u.id = o.userId
LEFT JOIN dbo.[User]    AS u2  ON u2.id = o.updatedUserId
WHERE
  o.active = 1
  AND p.active = 1
  AND g.active = 1
  AND tv.active = 1
  AND tobj.active = 1
  AND (m.active  = 1 OR o.marqueId  IS NULL)
  AND (mo.active = 1 OR o.modeleId  IS NULL)
  AND (v.active  = 1 OR o.versionId IS NULL);


-- dbo.v_ActiveCounts source

CREATE VIEW dbo.v_ActiveCounts
AS
SELECT 'Filiale' AS table_name, COUNT(*) AS active_count FROM dbo.Filiale WHERE active = 1
UNION ALL SELECT 'Groupement', COUNT(*) FROM dbo.Groupement WHERE active = 1
UNION ALL SELECT 'Permission', COUNT(*) FROM dbo.Permission WHERE active = 1
UNION ALL SELECT 'Role', COUNT(*) FROM dbo.[Role] WHERE active = 1
UNION ALL SELECT 'Succursale', COUNT(*) FROM dbo.Succursale WHERE active = 1
UNION ALL SELECT 'Marque', COUNT(*) FROM dbo.Marque WHERE active = 1
UNION ALL SELECT 'Modele', COUNT(*) FROM dbo.Modele WHERE active = 1
UNION ALL SELECT 'Version', COUNT(*) FROM dbo.Version WHERE active = 1
UNION ALL SELECT '[User]', COUNT(*) FROM dbo.[User] WHERE active = 1;


-- dbo.v_AuditLog source

CREATE VIEW dbo.v_AuditLog
AS
SELECT
  a.id,
  a.[timestamp],
  a.module,
  a.objectId,
  a.[scope],
  a.userId   AS user_identifier,
  u.id       AS user_id,
  u.username,
  u.full_name,
  a.message,
  a.[action],
  a.machineIp,
  a.description
FROM dbo.AuditLog a
LEFT JOIN dbo.[User] u
  ON u.username = a.userId
  OR u.email    = a.userId;


-- dbo.v_MarqueCoverage source

CREATE VIEW dbo.v_MarqueCoverage
AS
SELECT
  m.id   AS marque_id,
  m.name AS marque_name,
  f.name AS filiale_name,
  COUNT(DISTINCT mo.id) AS modele_count,
  COUNT(DISTINCT v.id)  AS version_count
FROM dbo.Marque m
JOIN dbo.Filiale f ON f.id = m.idFiliale
LEFT JOIN dbo.Modele mo ON mo.idMarque = m.id AND mo.active = 1
LEFT JOIN dbo.Version v ON v.idModele = mo.id AND v.active = 1
WHERE m.active = 1 AND f.active = 1
GROUP BY m.id, m.name, f.name;


-- dbo.v_MarqueDetails source

CREATE VIEW dbo.v_MarqueDetails
AS
SELECT
  m.id       AS marque_id,
  m.name     AS marque_name,
  f.name     AS filiale_name,
  m.active   AS marque_active,
  COUNT(DISTINCT mo.id) AS modele_count,
  COUNT(DISTINCT v.id)  AS version_count
FROM dbo.Marque m
JOIN dbo.Filiale f       ON f.id = m.idFiliale
LEFT JOIN dbo.Modele mo  ON mo.idMarque = m.id
LEFT JOIN dbo.Version v  ON v.idModele = mo.id
GROUP BY m.id, m.name, f.name, m.active;


-- dbo.v_ModeleVersionCoverage source

CREATE VIEW dbo.v_ModeleVersionCoverage
AS
SELECT
  mo.id           AS modele_id,
  mo.name         AS modele_name,
  m.name          AS marque_name,
  COUNT(v.id)     AS version_count
FROM dbo.Modele mo
JOIN dbo.Marque m     ON m.id = mo.idMarque
LEFT JOIN dbo.Version v ON v.idModele = mo.id AND v.active = 1
WHERE mo.active = 1
GROUP BY mo.id, mo.name, m.name;


-- dbo.v_ProductHierarchy source

CREATE VIEW dbo.v_ProductHierarchy
AS
SELECT
  f.id    AS filiale_id,  f.name AS filiale_name,
  m.id    AS marque_id,   m.name AS marque_name,
  mo.id   AS modele_id,   mo.name AS modele_name,
  v.id    AS version_id,  v.name AS version_name
FROM dbo.Filiale f
JOIN dbo.Marque  m  ON m.idFiliale = f.id
JOIN dbo.Modele  mo ON mo.idMarque = m.id
LEFT JOIN dbo.Version v ON v.idModele = mo.id
WHERE f.active = 1 AND m.active = 1 AND mo.active = 1
  AND (v.id IS NULL OR v.active = 1);


-- dbo.v_ProductHierarchy_All source

CREATE   VIEW dbo.v_ProductHierarchy_All
AS
SELECT
  f.id   AS filiale_id,
  f.name AS filiale_name,
  f.active AS filiale_active,
  m.id   AS marque_id,
  m.name AS marque_name,
  m.active AS marque_active,
  mo.id  AS modele_id,
  mo.name AS modele_name,
  mo.active AS modele_active,
  v.id   AS version_id,
  v.name AS version_name,
  v.active AS version_active
FROM dbo.Filiale f
LEFT JOIN dbo.Marque  m  ON m.idFiliale = f.id
LEFT JOIN dbo.Modele  mo ON mo.idMarque  = m.id
LEFT JOIN dbo.[Version] v ON v.idModele  = mo.id;


-- dbo.v_RolePermissionMatrix source

CREATE VIEW dbo.v_RolePermissionMatrix
AS
SELECT
  r.id         AS role_id,
  r.name       AS role_name,
  p.id         AS permission_id,
  p.name       AS permission_name,
  u.id         AS user_id,
  u.username   AS user_username
FROM dbo.[Role] r
JOIN dbo.UserRole ur         ON ur.idRole = r.id AND ur.active = 1
JOIN dbo.[User] u            ON u.id = ur.idUser AND u.active = 1
JOIN dbo.UserPermission up   ON up.idUser = u.id AND up.active = 1
JOIN dbo.Permission p        ON p.id = up.idPermission AND p.active = 1;


-- dbo.v_RolePermissionsSummary source

CREATE VIEW dbo.v_RolePermissionsSummary
AS
SELECT
  r.id         AS role_id,
  r.name       AS role_name,
  p.id         AS permission_id,
  p.name       AS permission_name,
  CASE WHEN r.active = 1 THEN 'Active' ELSE 'Inactive' END AS role_active,
  CASE WHEN p.active = 1 THEN 'Active' ELSE 'Inactive' END AS permission_active
FROM dbo.[Role] r
JOIN dbo.UserRole ur      ON ur.idRole = r.id
JOIN dbo.UserPermission up ON up.idUser = ur.idUser
JOIN dbo.Permission p     ON p.id = up.idPermission
GROUP BY r.id, r.name, p.id, p.name, r.active, p.active;


-- dbo.v_UserAccessSummary source

CREATE VIEW dbo.v_UserAccessSummary
AS
WITH roles AS (
  SELECT ur.idUser, STRING_AGG(r.name, ', ') WITHIN GROUP (ORDER BY r.name) AS roles
  FROM dbo.UserRole ur
  JOIN dbo.[Role] r ON r.id = ur.idRole
  WHERE ur.active = 1 AND r.active = 1
  GROUP BY ur.idUser
),
perms AS (
  SELECT up.idUser, STRING_AGG(p.name, ', ') WITHIN GROUP (ORDER BY p.name) AS permissions
  FROM dbo.UserPermission up
  JOIN dbo.Permission p ON p.id = up.idPermission
  WHERE up.active = 1 AND p.active = 1
  GROUP BY up.idUser
)
SELECT
  u.id, u.full_name, u.email, u.username,
  COALESCE(r.roles, '')       AS roles,
  COALESCE(p.permissions, '') AS permissions
FROM dbo.[User] u
LEFT JOIN roles r ON r.idUser = u.id
LEFT JOIN perms p ON p.idUser = u.id
WHERE u.active = 1;


-- dbo.v_UserActive source

CREATE VIEW dbo.v_UserActive
AS
SELECT id, full_name, email, username, idUserSite, createdAt, updatedAt
FROM dbo.[User]
WHERE active = 1;


-- dbo.v_UserAuditTrail source

CREATE VIEW dbo.v_UserAuditTrail
AS
SELECT
  a.id              AS audit_id,
  a.[timestamp],
  a.module,
  a.objectId,
  a.[action],
  a.message,
  a.machineIp,
  a.description,
  u.id              AS user_id,
  u.full_name,
  u.username,
  r.name            AS user_role
FROM dbo.AuditLog a
LEFT JOIN dbo.[User] u
  ON u.username = a.userId OR u.email = a.userId
LEFT JOIN dbo.UserRole ur
  ON ur.idUser = u.id AND ur.active = 1
LEFT JOIN dbo.[Role] r
  ON r.id = ur.idRole AND r.active = 1
WHERE u.active = 1;


-- dbo.v_UserLoginAudit source

CREATE VIEW dbo.v_UserLoginAudit
AS
SELECT
  u.id             AS user_id,
  u.username,
  u.full_name,
  COUNT(a.id)      AS audit_action_count
FROM dbo.[User] u
LEFT JOIN dbo.AuditLog a ON u.username = a.userId OR u.email = a.userId
WHERE u.active = 1
GROUP BY u.id, u.username, u.full_name;


-- dbo.v_UserRoles source

CREATE VIEW dbo.v_UserRoles
AS
SELECT
  u.id         AS user_id,
  u.full_name,
  u.username,
  r.id         AS role_id,
  r.name       AS role_name,
  ur.active    AS mapping_active
FROM dbo.UserRole ur
JOIN dbo.[User] u ON u.id = ur.idUser
JOIN dbo.[Role] r ON r.id = ur.idRole;


-- dbo.v_UserSiteType source

CREATE VIEW dbo.v_UserSiteType
AS
SELECT
  u.id               AS user_id,
  u.full_name,
  u.username,
  g.name             AS groupement_name,
  us.idSite          AS site_id,
  CASE
    WHEN CHARINDEX('filiale', LOWER(g.name)) > 0 THEN 'Filiale'
    WHEN CHARINDEX('succursale', LOWER(g.name)) > 0 THEN 'Succursale'
    ELSE 'Unknown'
  END                AS site_type,
  f.name             AS filiale_name,
  s.name             AS succursale_name,
  us.active          AS usersite_active
FROM dbo.[User] u
LEFT JOIN dbo.UserSite   us ON us.id = u.idUserSite
LEFT JOIN dbo.Groupement g  ON g.id = us.idGroupement
LEFT JOIN dbo.Filiale    f  ON f.id = us.idSite AND CHARINDEX('filiale', LOWER(g.name)) > 0
LEFT JOIN dbo.Succursale s  ON s.id = us.idSite AND CHARINDEX('succursale', LOWER(g.name)) > 0
WHERE u.active = 1;


-- dbo.v_UserSites source

CREATE VIEW dbo.v_UserSites
AS
SELECT
  u.id         AS user_id,
  u.full_name,
  u.username,
  g.id         AS groupement_id,
  g.name       AS groupement_name,
  s.id         AS site_id,
  s.name       AS site_name,
  us.active    AS usersite_active
FROM dbo.[User] u
LEFT JOIN dbo.UserSite   us ON us.id = u.idUserSite
LEFT JOIN dbo.Groupement g  ON g.id = us.idGroupement
LEFT JOIN dbo.Succursale s  ON s.id = us.idSite; -- assumption based on column name;


-- dbo.v_marque source

-- Update v_marque view to include idFiliale for filtering
CREATE   VIEW [dbo].[v_marque]
AS
SELECT
    ma.id AS id,
    ma.name AS nom,
    ma.active AS active,
    ma.imageUrl AS image,
    ma.idFiliale AS idFiliale,  -- Add this line

    -- Prix de vente moyen de la marque = moyenne simple des prix moyens des modèles
    CAST(ISNULL(AVG(vm.prixVenteMoyen), 0) AS decimal(18,2)) AS prixVenteMoyen,

    -- Chiffre d'affaires de la marque = somme des CA des modèles
    CAST(ISNULL(SUM(vm.chiffreAffaire), 0) AS decimal(18,2)) AS chiffreAffaire,

    -- TM Direct (moyenne pondérée par le CA des modèles)
    CAST(
        ISNULL(
            SUM(vm.chiffreAffaire * vm.tmDirect) / NULLIF(SUM(vm.chiffreAffaire), 0),
        0)
        AS decimal(5,2)
    ) AS tmDirect,

    -- TM Inter Groupe (moyenne pondérée par le CA des modèles)
    CAST(
        ISNULL(
            SUM(vm.chiffreAffaire * vm.tmInterGroupe) / NULLIF(SUM(vm.chiffreAffaire), 0),
        0)
        AS decimal(5,2)
    ) AS tmInterGroupe

FROM dbo.Marque AS ma
LEFT JOIN dbo.v_modele AS vm
    ON vm.idMarque = ma.id
GROUP BY
    ma.id, ma.name, ma.active, ma.imageUrl, ma.idFiliale;


-- dbo.v_modele source

-- Update v_modele view to include active status
CREATE   VIEW [dbo].[v_modele]
AS
SELECT
    m.id                                         AS id,
    m.name                                       AS nom,
    m.idMarque                                   AS idMarque,
    ma.name                                      AS nomMarque,
    m.active                                     AS active,
    m.imageUrl                                   AS image,

    CAST(ISNULL(AVG(v.SalePrice), 0) AS decimal(18,2)) AS prixVenteMoyen,
    CAST(ISNULL(SUM(v.SalePrice * v.volume), 0) AS decimal(18,2)) AS chiffreAffaire,
    
    CAST(
        ISNULL(
            SUM(v.SalePrice * v.volume * v.TMDirect)
            / NULLIF(SUM(v.SalePrice * v.volume), 0),
        0)
        AS decimal(5,2)
    ) AS tmDirect,
    
    CAST(
        ISNULL(
            SUM(v.SalePrice * v.volume * v.TMInterGroupe)
            / NULLIF(SUM(v.SalePrice * v.volume), 0),
        0)
        AS decimal(5,2)
    ) AS tmInterGroupe

FROM dbo.Modele AS m
LEFT JOIN dbo.Version AS v
    ON v.idModele = m.id
LEFT JOIN dbo.Marque AS ma
    ON ma.id = m.idMarque
GROUP BY
    m.id, m.name, m.idMarque, ma.name, m.active, m.imageUrl;


-- dbo.v_version source

-- Update v_version view to include active status and volume
CREATE   VIEW [dbo].[v_version]
AS
SELECT
    v.id                 AS id,
    v.name               AS nom,
    v.idModele           AS idModele,
    m.name               AS nomModele,
    m.idMarque           AS idMarque,
    ma.name              AS nomMarque,
    v.active             AS active,
    v.volume             AS volume,
    v.SalePrice          AS prixDeVente,
    v.TMDirect           AS tmDirect,
    v.TMInterGroupe      AS tmInterGroupe
FROM dbo.Version AS v
LEFT JOIN dbo.Modele AS m
    ON v.idModele = m.id
LEFT JOIN dbo.Marque AS ma
    ON m.idMarque = ma.id;


-- dbo.vw_UserCompleteInfo source

CREATE VIEW vw_UserCompleteInfo
AS
SELECT 
    -- User Basic Information
    u.id AS UserId,
    u.full_name AS FullName,
    u.email AS Email,
    u.username AS Username,
    u.actif AS UserActive,
    u.active AS UserEnabled,
    u.createdAt AS UserCreatedAt,
    u.updatedAt AS UserUpdatedAt,
    
    -- UserSite Information
    us.id AS UserSiteId,
    g.name AS GroupementType,
    us.idSite AS SiteId,
    us.active AS UserSiteActive,
    
    -- Site Details (Filiale or Succursale)
    CASE 
        WHEN LOWER(g.name) = 'filiale' THEN f.name
        WHEN LOWER(g.name) = 'succursale' THEN s.name
        ELSE 'Unknown Site'
    END AS SiteName,
    
    CASE 
        WHEN LOWER(g.name) = 'filiale' THEN f.active
        WHEN LOWER(g.name) = 'succursale' THEN s.active
        ELSE NULL
    END AS SiteActive,
    
    -- Roles Information (Aggregated)
    STUFF((
        SELECT ', ' + r.name + ' (' + CASE WHEN ur.active = 1 THEN 'Active' ELSE 'Inactive' END + ')'
        FROM UserRole ur
        INNER JOIN [Role] r ON ur.idRole = r.id
        WHERE ur.idUser = u.id
        FOR XML PATH('')
    ), 1, 2, '') AS UserRoles,
    
    -- Count of Active Roles
    (
        SELECT COUNT(*)
        FROM UserRole ur
        INNER JOIN [Role] r ON ur.idRole = r.id
        WHERE ur.idUser = u.id AND ur.active = 1 AND r.active = 1
    ) AS ActiveRolesCount,
    
    -- Permissions Information (Aggregated)
    STUFF((
        SELECT ', ' + p.name + ' (' + CASE WHEN up.active = 1 THEN 'Active' ELSE 'Inactive' END + ')'
        FROM UserPermission up
        INNER JOIN Permission p ON up.idPermission = p.id
        WHERE up.idUser = u.id
        FOR XML PATH('')
    ), 1, 2, '') AS UserPermissions,
    
    -- Count of Active Permissions
    (
        SELECT COUNT(*)
        FROM UserPermission up
        INNER JOIN Permission p ON up.idPermission = p.id
        WHERE up.idUser = u.id AND up.active = 1 AND p.active = 1
    ) AS ActivePermissionsCount,
    
    -- Combined Status Indicators
    CASE 
        WHEN u.active = 1 AND u.actif = 1 THEN 'Active'
        WHEN u.active = 1 AND u.actif = 0 THEN 'Enabled but Inactive'
        WHEN u.active = 0 THEN 'Disabled'
        ELSE 'Unknown'
    END AS UserStatus,
    
    -- Last Audit Activity (if available)
    (
        SELECT TOP 1 al.[timestamp]
        FROM AuditLog al
        WHERE CAST(al.objectId AS VARCHAR) = CAST(u.id AS VARCHAR)
          AND al.module = 'UserManagement'
        ORDER BY al.[timestamp] DESC
    ) AS LastActivity

FROM [User] u
LEFT JOIN UserSite us ON u.idUserSite = us.id
LEFT JOIN Groupement g ON us.idGroupement = g.id
LEFT JOIN Filiale f ON (us.idSite = f.id AND LOWER(g.name) = 'filiale')
LEFT JOIN Succursale s ON (us.idSite = s.id AND LOWER(g.name) = 'succursale');


-- dbo.vw_UserPermissionsDetail source

CREATE VIEW vw_UserPermissionsDetail
AS
SELECT 
    u.id AS UserId,
    u.username AS Username,
    u.full_name AS FullName,
    p.id AS PermissionId,
    p.name AS PermissionName,
    up.active AS UserPermissionActive,
    p.active AS PermissionActive,
    CASE 
        WHEN up.active = 1 AND p.active = 1 THEN 'Active'
        WHEN up.active = 0 THEN 'User Permission Inactive'
        WHEN p.active = 0 THEN 'Permission Inactive'
        ELSE 'Inactive'
    END AS Status
FROM [User] u
INNER JOIN UserPermission up ON u.id = up.idUser
INNER JOIN Permission p ON up.idPermission = p.id;


-- dbo.vw_UserRolesDetail source

CREATE VIEW vw_UserRolesDetail
AS
SELECT 
    u.id AS UserId,
    u.username AS Username,
    u.full_name AS FullName,
    r.id AS RoleId,
    r.name AS RoleName,
    r.description AS RoleDescription,
    ur.active AS UserRoleActive,
    r.active AS RoleActive,
    CASE 
        WHEN ur.active = 1 AND r.active = 1 THEN 'Active'
        WHEN ur.active = 0 THEN 'User Role Inactive'
        WHEN r.active = 0 THEN 'Role Inactive'
        ELSE 'Inactive'
    END AS Status
FROM [User] u
INNER JOIN UserRole ur ON u.id = ur.idUser
INNER JOIN [Role] r ON ur.idRole = r.id;


-- dbo.vw_UserSiteSummary source

CREATE VIEW vw_UserSiteSummary
AS
SELECT 
    us.id AS UserSiteId,
    g.name AS GroupementType,
    us.idSite AS SiteId,
    CASE 
        WHEN LOWER(g.name) = 'filiale' THEN f.name
        WHEN LOWER(g.name) = 'succursale' THEN s.name
        ELSE 'Unknown Site'
    END AS SiteName,
    COUNT(u.id) AS UsersCount,
    COUNT(CASE WHEN u.active = 1 AND u.actif = 1 THEN 1 END) AS ActiveUsersCount
FROM UserSite us
LEFT JOIN Groupement g ON us.idGroupement = g.id
LEFT JOIN Filiale f ON (us.idSite = f.id AND LOWER(g.name) = 'filiale')
LEFT JOIN Succursale s ON (us.idSite = s.id AND LOWER(g.name) = 'succursale')
LEFT JOIN [User] u ON us.id = u.idUserSite
GROUP BY us.id, g.name, us.idSite, f.name, s.name;
/* ============================================
   AppParameter — FUNCTIONS
   ============================================ */

-- Does a parameter with this key exist? (optionally only active)
CREATE   FUNCTION dbo.fn_AppParameterExists
(
    @Key        VARCHAR(100),
    @OnlyActive BIT = 1
)
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.AppParameter
        WHERE [key] = @Key
          AND (@OnlyActive = 0 OR active = 1)
    ) THEN 1 ELSE 0 END;
END;

CREATE FUNCTION dbo.fn_diagramobjects() 
	RETURNS int
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		declare @id_upgraddiagrams		int
		declare @id_sysdiagrams			int
		declare @id_helpdiagrams		int
		declare @id_helpdiagramdefinition	int
		declare @id_creatediagram	int
		declare @id_renamediagram	int
		declare @id_alterdiagram 	int 
		declare @id_dropdiagram		int
		declare @InstalledObjects	int

		select @InstalledObjects = 0

		select 	@id_upgraddiagrams = object_id(N'dbo.sp_upgraddiagrams'),
			@id_sysdiagrams = object_id(N'dbo.sysdiagrams'),
			@id_helpdiagrams = object_id(N'dbo.sp_helpdiagrams'),
			@id_helpdiagramdefinition = object_id(N'dbo.sp_helpdiagramdefinition'),
			@id_creatediagram = object_id(N'dbo.sp_creatediagram'),
			@id_renamediagram = object_id(N'dbo.sp_renamediagram'),
			@id_alterdiagram = object_id(N'dbo.sp_alterdiagram'), 
			@id_dropdiagram = object_id(N'dbo.sp_dropdiagram')

		if @id_upgraddiagrams is not null
			select @InstalledObjects = @InstalledObjects + 1
		if @id_sysdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 2
		if @id_helpdiagrams is not null
			select @InstalledObjects = @InstalledObjects + 4
		if @id_helpdiagramdefinition is not null
			select @InstalledObjects = @InstalledObjects + 8
		if @id_creatediagram is not null
			select @InstalledObjects = @InstalledObjects + 16
		if @id_renamediagram is not null
			select @InstalledObjects = @InstalledObjects + 32
		if @id_alterdiagram  is not null
			select @InstalledObjects = @InstalledObjects + 64
		if @id_dropdiagram is not null
			select @InstalledObjects = @InstalledObjects + 128
		
		return @InstalledObjects 
	END;

-- Exists (Filiale)
CREATE   FUNCTION dbo.fn_FilialeExists(@name VARCHAR(255))
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (SELECT 1 FROM dbo.Filiale WHERE name = @name AND active = 1) THEN 1 ELSE 0 END;
END;

-- Format datetime (keep as-is; FORMAT is fine here)
CREATE   FUNCTION dbo.fn_FormatDateTime(@datetime DATETIME2, @format VARCHAR(20) = 'standard')
RETURNS VARCHAR(50)
AS
BEGIN
    RETURN CASE @format
        WHEN 'date-only' THEN FORMAT(@datetime, 'yyyy-MM-dd')
        WHEN 'time-only' THEN FORMAT(@datetime, 'HH:mm:ss')
        WHEN 'short'     THEN FORMAT(@datetime, 'yyyy-MM-dd HH:mm')
        ELSE                 FORMAT(@datetime, 'yyyy-MM-dd HH:mm:ss')
    END;
END;

-- TVF: DO NOT order inside; caller should ORDER BY
CREATE   FUNCTION dbo.fn_GetAllFilialeNames()
RETURNS TABLE
AS
RETURN
(
    SELECT id, name
    FROM dbo.Filiale
    WHERE active = 1
);

-- List marques (optionally filtered by filiale and/or active)
CREATE   FUNCTION dbo.fn_GetAllMarques
(
    @IdFiliale  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idFiliale, active
    FROM dbo.Marque
    WHERE (@IdFiliale IS NULL OR idFiliale = @IdFiliale)
      AND (@OnlyActive = 0 OR active = 1)
);

-- List modeles (optionally by marque and/or active)
CREATE   FUNCTION dbo.fn_GetAllModeles
(
    @IdMarque  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idMarque, active
    FROM dbo.Modele
    WHERE (@IdMarque IS NULL OR idMarque = @IdMarque)
      AND (@OnlyActive = 0 OR active = 1)
);

-- All succursales (optionally only active)
CREATE   FUNCTION dbo.fn_GetAllSuccursales (@OnlyActive BIT = 1)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, active
    FROM dbo.Succursale
    WHERE (@OnlyActive = 0 OR active = 1)
);

-- List versions (optionally by modele and/or active)
CREATE   FUNCTION dbo.fn_GetAllVersions
(
    @IdModele  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idModele, active
    FROM dbo.[Version]
    WHERE (@IdModele IS NULL OR idModele = @IdModele)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Audit summary
CREATE   FUNCTION dbo.fn_GetAuditSummary(@startDate DATE, @endDate DATE)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CAST([timestamp] AS DATE) AS audit_date,
        module,
        [action],
        COUNT(*) AS action_count,
        COUNT(DISTINCT userId) AS unique_users
    FROM dbo.AuditLog
    WHERE CAST([timestamp] AS DATE) BETWEEN @startDate AND @endDate
    GROUP BY CAST([timestamp] AS DATE), module, [action]
);

-- Brand hierarchy
CREATE   FUNCTION dbo.fn_GetBrandHierarchy(@filialeId INT = NULL)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        f.id   AS filiale_id,
        f.name AS filiale_name,
        m.id   AS marque_id,
        m.name AS marque_name,
        md.id  AS modele_id,
        md.name AS modele_name,
        v.id   AS version_id,
        v.name AS version_name
    FROM dbo.Filiale f
    LEFT JOIN dbo.Marque m ON f.id = m.idFiliale AND m.active = 1
    LEFT JOIN dbo.Modele md ON m.id = md.idMarque AND md.active = 1
    LEFT JOIN dbo.[Version] v ON md.id = v.idModele AND v.active = 1
    WHERE f.active = 1
      AND (@filialeId IS NULL OR f.id = @filialeId)
);

-- Filiale name by id
CREATE   FUNCTION dbo.fn_GetFilialeName(@id INT)
RETURNS VARCHAR(255)
AS
BEGIN
    DECLARE @name VARCHAR(255);
    SELECT @name = name FROM dbo.Filiale WHERE id = @id AND active = 1;
    RETURN @name;
END;

-- Get name by id (NULL if not found or inactive when OnlyActive=1)
CREATE   FUNCTION dbo.fn_GetMarqueName
(
    @id INT,
    @OnlyActive BIT = 1
)
RETURNS VARCHAR(255)
AS
BEGIN
    DECLARE @name VARCHAR(255);
    SELECT @name = name
    FROM dbo.Marque
    WHERE id = @id AND (@OnlyActive = 0 OR active = 1);
    RETURN @name;
END;

-- 2) Name by id (scalar)
CREATE   FUNCTION dbo.fn_GetModeleName
(
    @id INT,
    @OnlyActive BIT = 1
)
RETURNS VARCHAR(255)
AS
BEGIN
    DECLARE @name VARCHAR(255);
    SELECT @name = name
    FROM dbo.Modele
    WHERE id = @id AND (@OnlyActive = 0 OR active = 1);
    RETURN @name;
END;

-- List parameters with optional filters (type/scope/active)
CREATE   FUNCTION dbo.fn_GetParameters
(
    @Type       VARCHAR(50)  = NULL,
    @Scope      VARCHAR(100) = NULL,
    @OnlyActive BIT          = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
    FROM dbo.AppParameter
    WHERE (@Type  IS NULL OR [type]  = @Type)
      AND (@Scope IS NULL OR [scope] = @Scope)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Parameters by type (inline TVF)
CREATE   FUNCTION dbo.fn_GetParametersByType(@type VARCHAR(50))
RETURNS TABLE
AS
RETURN
(
    SELECT
        [key], [value], [description], [scope], createdAt, updatedAt, active
    FROM dbo.AppParameter
    WHERE [type] = @type AND active = 1
);

-- Get parameter value by key (returns NULL if not found / inactive when OnlyActive=1)
CREATE   FUNCTION dbo.fn_GetParameterValue
(
    @Key        VARCHAR(100),
    @OnlyActive BIT = 1
)
RETURNS VARCHAR(1000)
AS
BEGIN
    DECLARE @val VARCHAR(1000);
    SELECT TOP (1) @val = [value]
    FROM dbo.AppParameter
    WHERE [key] = @Key
      AND (@OnlyActive = 0 OR active = 1);
    RETURN @val;
END;

-- Get a succursale name by id (NULL if not found or inactive when OnlyActive=1)
CREATE   FUNCTION dbo.fn_GetSuccursaleName (@id INT, @OnlyActive BIT = 1)
RETURNS VARCHAR(255)
AS
BEGIN
    DECLARE @name VARCHAR(255);
    SELECT @name = name
    FROM dbo.Succursale
    WHERE id = @id AND (@OnlyActive = 0 OR active = 1);
    RETURN @name;
END;

-- User details
CREATE   FUNCTION dbo.fn_GetUserDetails(@userId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        u.id,
        u.full_name,
        u.email,
        u.username,
        u.actif,
        u.createdAt,
        g.name AS groupement_name,
        us.idSite
    FROM dbo.[User] u
    LEFT JOIN dbo.UserSite  us ON u.idUserSite = us.id
    LEFT JOIN dbo.Groupement g ON us.idGroupement = g.id
    WHERE u.id = @userId AND u.active = 1
);

-- User roles (only active link + active role)
CREATE   FUNCTION dbo.fn_GetUserRoles (@userId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT r.name
    FROM dbo.UserRole ur
    JOIN dbo.[Role]  r ON ur.idRole = r.id
    WHERE ur.idUser = @userId
      AND ur.active = 1
      AND r.active  = 1
);

-- Get version name by id (NULL if not found/inactive when OnlyActive=1)
CREATE   FUNCTION dbo.fn_GetVersionName
(
    @id INT,
    @OnlyActive BIT = 1
)
RETURNS VARCHAR(255)
AS
BEGIN
    DECLARE @name VARCHAR(255);
    SELECT @name = name
    FROM dbo.[Version]
    WHERE id = @id AND (@OnlyActive = 0 OR active = 1);
    RETURN @name;
END;

-- Email availability: must check ALL rows (unique constraint ignores "active")
CREATE   FUNCTION dbo.fn_IsEmailAvailable(@email VARCHAR(255), @excludeUserId INT = NULL)
RETURNS BIT
AS
BEGIN
    RETURN CASE 
        WHEN EXISTS (
            SELECT 1 FROM dbo.[User]
            WHERE email = @email
              AND (@excludeUserId IS NULL OR id <> @excludeUserId)
        ) THEN 0 ELSE 1
    END;
END;

-- Username availability: must check ALL rows
CREATE   FUNCTION dbo.fn_IsUsernameAvailable(@username VARCHAR(100), @excludeUserId INT = NULL)
RETURNS BIT
AS
BEGIN
    RETURN CASE 
        WHEN EXISTS (
            SELECT 1 FROM dbo.[User]
            WHERE username = @username
              AND (@excludeUserId IS NULL OR id <> @excludeUserId)
        ) THEN 0 ELSE 1
    END;
END;

-- Email validity (kept as-is)
CREATE   FUNCTION dbo.fn_IsValidEmail(@email VARCHAR(255))
RETURNS BIT
AS
BEGIN
    RETURN CASE 
        WHEN @email IS NULL THEN 0
        WHEN LEN(@email) < 6 THEN 0
        WHEN LEN(@email) > 255 THEN 0
        WHEN @email NOT LIKE '%_@_%._%' THEN 0
        WHEN @email LIKE '%@%@%' THEN 0
        ELSE 1
    END;
END;

-- Username validity (kept as-is)
CREATE   FUNCTION dbo.fn_IsValidUsername(@username VARCHAR(100))
RETURNS BIT
AS
BEGIN
    RETURN CASE 
        WHEN @username IS NULL THEN 0
        WHEN LEN(@username) < 3 OR LEN(@username) > 100 THEN 0
        WHEN @username NOT LIKE '[A-Za-z]%' THEN 0
        WHEN @username LIKE '%[^A-Za-z0-9_-]%' THEN 0
        ELSE 1
    END;
END;

-- Exists? (optionally only active) and scoped to a filiale
CREATE   FUNCTION dbo.fn_MarqueExists
(
    @name       VARCHAR(255),
    @idFiliale  INT,
    @OnlyActive BIT = 1
)
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.Marque
        WHERE name = @name
          AND idFiliale = @idFiliale
          AND (@OnlyActive = 0 OR active = 1)
    ) THEN 1 ELSE 0 END;
END;

-- Lookup id by (name, filiale)
CREATE   FUNCTION dbo.fn_MarqueIdByName
(
    @name VARCHAR(255),
    @idFiliale INT,
    @OnlyActive BIT = 1
)
RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT TOP (1) @id = id
    FROM dbo.Marque
    WHERE name = @name
      AND idFiliale = @idFiliale
      AND (@OnlyActive = 0 OR active = 1)
    ORDER BY id;
    RETURN @id;
END;

-- Does a modele with this (name, marque) exist? (optionally only active)
CREATE   FUNCTION dbo.fn_ModeleExists
(
    @name       VARCHAR(255),
    @idMarque   INT,
    @OnlyActive BIT = 1
)
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.Modele
        WHERE name = @name
          AND idMarque = @idMarque
          AND (@OnlyActive = 0 OR active = 1)
    ) THEN 1 ELSE 0 END;
END;

-- Lookup modele id by (name, marque)
CREATE   FUNCTION dbo.fn_ModeleIdByName
(
    @name VARCHAR(255),
    @idMarque INT,
    @OnlyActive BIT = 1
)
RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT TOP (1) @id = id
    FROM dbo.Modele
    WHERE name = @name
      AND idMarque = @idMarque
      AND (@OnlyActive = 0 OR active = 1)
    ORDER BY id;
    RETURN @id;
END;

-- Search by name (optionally filter by filiale and/or active)
CREATE   FUNCTION dbo.fn_SearchMarques
(
    @q          VARCHAR(255),
    @IdFiliale  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idFiliale, active
    FROM dbo.Marque
    WHERE name LIKE '%' + @q + '%'
      AND (@IdFiliale IS NULL OR idFiliale = @IdFiliale)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Search by name (optionally by marque and/or active)
CREATE   FUNCTION dbo.fn_SearchModeles
(
    @q         VARCHAR(255),
    @IdMarque  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idMarque, active
    FROM dbo.Modele
    WHERE name LIKE '%' + @q + '%'
      AND (@IdMarque IS NULL OR idMarque = @IdMarque)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Search across key / value / description with optional filters
CREATE   FUNCTION dbo.fn_SearchParameters
(
    @q          VARCHAR(255),
    @Type       VARCHAR(50)  = NULL,
    @Scope      VARCHAR(100) = NULL,
    @OnlyActive BIT          = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
    FROM dbo.AppParameter
    WHERE (
            [key]        LIKE '%' + @q + '%'
         OR [value]      LIKE '%' + @q + '%'
         OR [description]LIKE '%' + @q + '%'
          )
      AND (@Type  IS NULL OR [type]  = @Type)
      AND (@Scope IS NULL OR [scope] = @Scope)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Search by name (optionally only active)
CREATE   FUNCTION dbo.fn_SearchSuccursales (@q VARCHAR(255), @OnlyActive BIT = 1)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, active
    FROM dbo.Succursale
    WHERE name LIKE '%' + @q + '%'
      AND (@OnlyActive = 0 OR active = 1)
);

-- Search by name (optionally by modele and/or active)
CREATE   FUNCTION dbo.fn_SearchVersions
(
    @q         VARCHAR(255),
    @IdModele  INT = NULL,
    @OnlyActive BIT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT id, name, idModele, active
    FROM dbo.[Version]
    WHERE name LIKE '%' + @q + '%'
      AND (@IdModele IS NULL OR idModele = @IdModele)
      AND (@OnlyActive = 0 OR active = 1)
);

-- Does a succursale with this name exist? (optionally only active)
CREATE   FUNCTION dbo.fn_SuccursaleExists
(
    @name       VARCHAR(255),
    @OnlyActive BIT = 1
)
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1 FROM dbo.Succursale
        WHERE name = @name AND (@OnlyActive = 0 OR active = 1)
    ) THEN 1 ELSE 0 END;
END;

-- ID lookup by name (first match)
CREATE   FUNCTION dbo.fn_SuccursaleIdByName (@name VARCHAR(255), @OnlyActive BIT = 1)
RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT TOP (1) @id = id
    FROM dbo.Succursale
    WHERE name = @name AND (@OnlyActive = 0 OR active = 1)
    ORDER BY id;
    RETURN @id;
END;

CREATE FUNCTION dbo.fn_UserCountByGroupement()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        g.id,
        g.name AS groupement_name,
        COUNT(u.id) AS total_users,
        COUNT(CASE WHEN u.actif = 1 THEN 1 END) AS active_users,
        COUNT(CASE WHEN u.actif = 0 THEN 1 END) AS inactive_users
    FROM Groupement g
    LEFT JOIN UserSite us ON g.id = us.idGroupement
    LEFT JOIN [User] u ON us.id = u.idUserSite AND u.active = 1
    WHERE g.active = 1
    GROUP BY g.id, g.name
);

-- Has named permission (direct only)
CREATE   FUNCTION dbo.fn_UserHasPermission(@UserId INT, @PermissionName VARCHAR(150))
RETURNS BIT
AS
BEGIN
    DECLARE @has BIT = 0;
    IF EXISTS (
        SELECT 1
        FROM dbo.UserPermission up
        JOIN dbo.Permission p ON p.id = up.idPermission
        WHERE up.idUser = @UserId AND up.active = 1 AND p.active = 1 AND p.name = @PermissionName
    ) SET @has = 1;
    RETURN @has;
END;

-- Has role
CREATE   FUNCTION dbo.fn_UserHasRole (@userId INT, @roleName VARCHAR(100))
RETURNS BIT
AS
BEGIN
    DECLARE @exists BIT = 0;
    IF EXISTS (
        SELECT 1
        FROM dbo.UserRole ur
        JOIN dbo.[Role] r ON ur.idRole = r.id
        WHERE ur.idUser = @userId
          AND ur.active = 1
          AND r.active  = 1
          AND r.name = @roleName
    ) SET @exists = 1;
    RETURN @exists;
END;

-- Identity string
CREATE   FUNCTION dbo.fn_UserIdentity (@userId INT)
RETURNS VARCHAR(400)
AS
BEGIN
    DECLARE @result VARCHAR(400);
    SELECT @result = username + '<' + email + '>'
    FROM dbo.[User]
    WHERE id = @userId;
    RETURN @result;
END;

-- Direct permissions (TVF)
CREATE   FUNCTION dbo.fn_UserPermissions(@UserId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT p.id, p.name, up.active
    FROM dbo.UserPermission up
    JOIN dbo.Permission p ON p.id = up.idPermission
    WHERE up.idUser = @UserId AND up.active = 1 AND p.active = 1
);

-- Profile TVF
CREATE   FUNCTION dbo.fn_UserProfile(@UserId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT
        u.id,
        u.full_name,
        u.email,
        u.username,
        u.actif,
        u.active,
        u.createdAt,
        u.updatedAt,
        us.id           AS idUserSite,
        us.idGroupement,
        g.name          AS groupementName,
        us.idSite
    FROM dbo.[User] u
    LEFT JOIN dbo.UserSite  us ON us.id = u.idUserSite
    LEFT JOIN dbo.Groupement g ON g.id = us.idGroupement
    WHERE u.id = @UserId
);

/* ===========================
   VERSION – FUNCTIONS
   =========================== */

-- Exists? (optionally only active)
CREATE   FUNCTION dbo.fn_VersionExists
(
    @name       VARCHAR(255),
    @idModele   INT,
    @OnlyActive BIT = 1
)
RETURNS BIT
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.[Version]
        WHERE name = @name
          AND idModele = @idModele
          AND (@OnlyActive = 0 OR active = 1)
    ) THEN 1 ELSE 0 END;
END;

-- Lookup version id by (name, modele)
CREATE   FUNCTION dbo.fn_VersionIdByName
(
    @name VARCHAR(255),
    @idModele INT,
    @OnlyActive BIT = 1
)
RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT TOP (1) @id = id
    FROM dbo.[Version]
    WHERE name = @name
      AND idModele = @idModele
      AND (@OnlyActive = 0 OR active = 1)
    ORDER BY id;
    RETURN @id;
END;
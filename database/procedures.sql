CREATE PROCEDURE sp_ActivateFiliale
    @id INT
AS
BEGIN
    UPDATE Filiale
    SET active = 1
    WHERE id = @id;
END;

CREATE PROCEDURE sp_ActivateGroupement
    @id INT
AS
BEGIN
    UPDATE Groupement
    SET active = 1
    WHERE id = @id;
END;

CREATE PROCEDURE sp_ActivateRole
    @id INT
AS
BEGIN
    UPDATE [Role]
    SET active = 1
    WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_ActivateUserRole
    @idUser INT,
    @idRole INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE autohall.dbo.UserRole
    SET active = 1
    WHERE idUser = @idUser AND idRole = @idRole;
END;

CREATE PROCEDURE dbo.sp_ActivateUserSite
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE autohall.dbo.UserSite SET active = 1 WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_AddUserRole
    @idUser INT,
    @idRole INT,
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate User exists
    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.[User] u WHERE u.id = @idUser)
    BEGIN
        RAISERROR('User id %d does not exist.', 16, 1, @idUser);
        RETURN;
    END;

    -- Validate Role exists
    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.[Role] r WHERE r.id = @idRole)
    BEGIN
        RAISERROR('Role id %d does not exist.', 16, 1, @idRole);
        RETURN;
    END;

    -- Insert or ignore if already exists
    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.UserRole WHERE idUser = @idUser AND idRole = @idRole)
    BEGIN
        INSERT INTO autohall.dbo.UserRole (idUser, idRole, active)
        VALUES (@idUser, @idRole, @active);
    END
    ELSE
    BEGIN
        RAISERROR('UserRole already exists.', 16, 1);
    END;
END;

CREATE PROCEDURE dbo.sp_alterdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null,
		@version 	int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId 			int
		declare @retval 		int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @ShouldChangeUID	int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid ARG', 16, 1)
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();	 
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		revert;
	
		select @ShouldChangeUID = 0
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		
		if(@DiagId IS NULL or (@IsDbo = 0 and @theId <> @UIDFound))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end
	
		if(@IsDbo <> 0)
		begin
			if(@UIDFound is null or USER_NAME(@UIDFound) is null) -- invalid principal_id
			begin
				select @ShouldChangeUID = 1 ;
			end
		end

		-- update dds data			
		update dbo.sysdiagrams set definition = @definition where diagram_id = @DiagId ;

		-- change owner
		if(@ShouldChangeUID = 1)
			update dbo.sysdiagrams set principal_id = @theId where diagram_id = @DiagId ;

		-- update dds version
		if(@version is not null)
			update dbo.sysdiagrams set version = @version where diagram_id = @DiagId ;

		return 0
	END;

-- Activate / Deactivate by id
CREATE   PROCEDURE dbo.sp_AppParameter_Activate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.AppParameter WHERE id=@Id)
  BEGIN RAISERROR('AppParameter not found.', 16, 1); RETURN; END;

  UPDATE dbo.AppParameter
  SET active = 1, updatedAt = SYSUTCDATETIME()
  WHERE id = @Id;

  SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
  FROM dbo.AppParameter
  WHERE id = @Id;
END;

-- Strict create (errors if key exists)
CREATE   PROCEDURE dbo.sp_AppParameter_Create
  @Key         VARCHAR(100),
  @Value       VARCHAR(1000) = NULL,
  @Description VARCHAR(500)  = NULL,
  @Type        VARCHAR(50)   = NULL,
  @Scope       VARCHAR(100)  = NULL,
  @Active      BIT           = 1,
  @NewId       INT           = NULL OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM dbo.AppParameter WHERE [key] = @Key)
  BEGIN
    RAISERROR('An AppParameter with this key already exists.', 16, 1);
    RETURN;
  END;

  INSERT INTO dbo.AppParameter ([key], [value], [description], [type], [scope], active)
  VALUES (@Key, @Value, @Description, @Type, @Scope, @Active);

  SET @NewId = CONVERT(INT, SCOPE_IDENTITY());

  SELECT @NewId AS NewId, 'AppParameter created' AS Message;
END;

CREATE   PROCEDURE dbo.sp_AppParameter_Deactivate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.AppParameter WHERE id=@Id)
  BEGIN RAISERROR('AppParameter not found.', 16, 1); RETURN; END;

  UPDATE dbo.AppParameter
  SET active = 0, updatedAt = SYSUTCDATETIME()
  WHERE id = @Id;

  SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
  FROM dbo.AppParameter
  WHERE id = @Id;
END;

-- Hard delete by id
CREATE   PROCEDURE dbo.sp_AppParameter_Delete
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.AppParameter WHERE id=@Id)
  BEGIN RAISERROR('AppParameter not found.', 16, 1); RETURN; END;

  DELETE FROM dbo.AppParameter WHERE id = @Id;

  SELECT @Id AS DeletedId, 'AppParameter deleted' AS Message;
END;

/* ============================================
   AppParameter — PROCEDURES
   ============================================ */

-- Back-compat: get by key (your original name)
CREATE   PROCEDURE dbo.sp_AppParameter_Get
  @Key VARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP (1) id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
  FROM dbo.AppParameter
  WHERE [key] = @Key;
END;

-- Get by id
CREATE   PROCEDURE dbo.sp_AppParameter_GetById
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
  FROM dbo.AppParameter
  WHERE id = @Id;
END;

CREATE   PROCEDURE [dbo].[sp_AppParameter_List]
  @Type       VARCHAR(50)  = NULL,
  @Scope      VARCHAR(100) = NULL,
  @OnlyActive BIT          = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Get paginated results with total count
  SELECT 
    id, 
    [key], 
    [value], 
    [description], 
    [type], 
    [scope], 
    active, 
    createdAt, 
    updatedAt,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.AppParameter
  WHERE (@Type  IS NULL OR [type]  = @Type)
    AND (@Scope IS NULL OR [scope] = @Scope)
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY [key]
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[sp_AppParameter_Search]
  @q          VARCHAR(255),
  @Type       VARCHAR(50)  = NULL,
  @Scope      VARCHAR(100) = NULL,
  @OnlyActive BIT          = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Get paginated results with total count
  SELECT 
    id, 
    [key], 
    [value], 
    [description], 
    [type], 
    [scope], 
    active, 
    createdAt, 
    updatedAt,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.AppParameter
  WHERE (
         [key]         LIKE '%' + @q + '%'
      OR [value]       LIKE '%' + @q + '%'
      OR [description] LIKE '%' + @q + '%'
        )
    AND (@Type  IS NULL OR [type]  = @Type)
    AND (@Scope IS NULL OR [scope] = @Scope)
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY [key]
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

-- Upsert (create or update) — updates updatedAt on changes
CREATE   PROCEDURE dbo.sp_AppParameter_Set
  @Key         VARCHAR(100),
  @Value       VARCHAR(1000),
  @Description VARCHAR(500)  = NULL,
  @Type        VARCHAR(50)   = NULL,
  @Scope       VARCHAR(100)  = NULL,
  @Active      BIT           = 1
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM dbo.AppParameter WHERE [key] = @Key)
  BEGIN
      UPDATE dbo.AppParameter
      SET [value]      = @Value,
          [description]= ISNULL(@Description, [description]),
          [type]       = ISNULL(@Type, [type]),
          [scope]      = ISNULL(@Scope, [scope]),
          [active]     = @Active,
          updatedAt    = SYSUTCDATETIME()
      WHERE [key] = @Key;

      SELECT (SELECT id FROM dbo.AppParameter WHERE [key]=@Key) AS Id, 'AppParameter updated' AS Message;
      RETURN;
  END;

  INSERT INTO dbo.AppParameter ([key], [value], [description], [type], [scope], active)
  VALUES (@Key, @Value, @Description, @Type, @Scope, @Active);

  SELECT CONVERT(INT, SCOPE_IDENTITY()) AS Id, 'AppParameter created' AS Message;
END;

-- Partial update by Id OR by Key (supply one of them)
CREATE   PROCEDURE dbo.sp_AppParameter_Update
  @Id          INT           = NULL,
  @Key         VARCHAR(100)  = NULL,
  @Value       VARCHAR(1000) = NULL,
  @Description VARCHAR(500)  = NULL,
  @Type        VARCHAR(50)   = NULL,
  @Scope       VARCHAR(100)  = NULL,
  @Active      BIT           = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @Id IS NULL AND @Key IS NULL
  BEGIN
      RAISERROR('You must supply either @Id or @Key.', 16, 1);
      RETURN;
  END;

  IF @Id IS NULL
      SELECT @Id = id FROM dbo.AppParameter WHERE [key] = @Key;

  IF @Id IS NULL
  BEGIN
      RAISERROR('AppParameter not found.', 16, 1);
      RETURN;
  END;

  UPDATE p
  SET [value]       = COALESCE(@Value, p.[value]),
      [description] = COALESCE(@Description, p.[description]),
      [type]        = COALESCE(@Type, p.[type]),
      [scope]       = COALESCE(@Scope, p.[scope]),
      [active]      = COALESCE(@Active, p.[active]),
      updatedAt     = SYSUTCDATETIME()
  FROM dbo.AppParameter p
  WHERE p.id = @Id;

  SELECT id, [key], [value], [description], [type], [scope], active, createdAt, updatedAt
  FROM dbo.AppParameter
  WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_creatediagram
	(
		@diagramname 	sysname,
		@owner_id		int	= null, 	
		@version 		int,
		@definition 	varbinary(max)
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
	
		declare @theId int
		declare @retval int
		declare @IsDbo	int
		declare @userName sysname
		if(@version is null or @diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID(); 
		select @IsDbo = IS_MEMBER(N'db_owner');
		revert; 
		
		if @owner_id is null
		begin
			select @owner_id = @theId;
		end
		else
		begin
			if @theId <> @owner_id
			begin
				if @IsDbo = 0
				begin
					RAISERROR (N'E_INVALIDARG', 16, 1);
					return -1
				end
				select @theId = @owner_id
			end
		end
		-- next 2 line only for test, will be removed after define name unique
		if EXISTS(select diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @diagramname)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end
	
		insert into dbo.sysdiagrams(name, principal_id , version, definition)
				VALUES(@diagramname, @theId, @version, @definition) ;
		
		select @retval = @@IDENTITY 
		return @retval
	END;

-- Filiale create (kept uniqueness check by name)
CREATE   PROCEDURE dbo.sp_CreateFiliale
    @name   VARCHAR(255),
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @filialeId INT;

    IF EXISTS (SELECT 1 FROM dbo.Filiale WHERE name = @name)
    BEGIN
        RAISERROR('Filiale with this name already exists.', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.Filiale (name, active)
    VALUES (@name, @active);

    SET @filialeId = CONVERT(INT, SCOPE_IDENTITY());

    SELECT @filialeId AS FilialeId, 'Filiale created successfully' AS Message;
END;

-- Groupement create (names can repeat)
CREATE   PROCEDURE dbo.sp_CreateGroupement
    @Name            VARCHAR(255),
    @Active          BIT = 1,
    @NewGroupementId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Groupement (name, active)
    VALUES (@Name, @Active);

    SET @NewGroupementId = CONVERT(INT, SCOPE_IDENTITY());
END;

-- Role create (unique name)
CREATE   PROCEDURE dbo.sp_CreateRole
    @Name        VARCHAR(100),
    @Description VARCHAR(500) = NULL,
    @Active      BIT = 1,
    @NewRoleId   INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.[Role] WHERE name = @Name)
    BEGIN
        RAISERROR('Role with this name already exists.', 16, 1);
        RETURN;
    END;

    INSERT INTO dbo.[Role] (name, description, active)
    VALUES (@Name, @Description, @Active);

    SET @NewRoleId = CONVERT(INT, SCOPE_IDENTITY());
END;

-- User create (uses fixed availability checks)
CREATE   PROCEDURE dbo.sp_CreateUser
    @full_name  VARCHAR(255),
    @email      VARCHAR(255), 
    @username   VARCHAR(100),
    @password   VARCHAR(255),
    @idUserSite INT = NULL,
    @actif      BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @newUserId INT;

    IF dbo.fn_IsValidEmail(@email) = 0
    BEGIN RAISERROR('Invalid email format', 16, 1); RETURN; END;

    IF dbo.fn_IsValidUsername(@username) = 0
    BEGIN RAISERROR('Invalid username format', 16, 1); RETURN; END;

    IF dbo.fn_IsUsernameAvailable(@username, NULL) = 0
    BEGIN RAISERROR('Username already exists', 16, 1); RETURN; END;

    IF dbo.fn_IsEmailAvailable(@email, NULL) = 0
    BEGIN RAISERROR('Email already exists', 16, 1); RETURN; END;

    INSERT INTO dbo.[User] (full_name, email, username, [password], idUserSite, actif)
    VALUES (@full_name, @email, @username, @password, @idUserSite, @actif);

    SET @newUserId = CONVERT(INT, SCOPE_IDENTITY());

    SELECT @newUserId AS NewUserId, 'User created successfully' AS Message;
END;

CREATE   PROCEDURE sp_CreateUserWithRolePermissionsAndSite
    @full_name VARCHAR(255),
    @email VARCHAR(255),
    @username VARCHAR(100),
    @password VARCHAR(255),
    @groupement_name VARCHAR(255), -- 'filiale' or 'succursale'
    @site_id INT, -- ID from either Filiale or Succursale table
    @role_ids VARCHAR(MAX) = NULL, -- Comma-separated role IDs (optional)
    @permission_ids VARCHAR(MAX) = NULL -- Comma-separated permission IDs (optional)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @user_id INT;
    DECLARE @usersite_id INT;
    DECLARE @groupement_id INT;
    DECLARE @error_message VARCHAR(500);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Step 1: Check if username already exists
        IF EXISTS (SELECT 1 FROM [User] WHERE username = @username)
        BEGIN
            SET @error_message = 'Username ''' + @username + ''' already exists. Please choose a different username.';
            THROW 50007, @error_message, 1;
        END
        
        -- Step 2: Check if email already exists
        IF EXISTS (SELECT 1 FROM [User] WHERE email = @email)
        BEGIN
            SET @error_message = 'Email ''' + @email + ''' already exists. Please use a different email address.';
            THROW 50008, @error_message, 1;
        END
        
        -- Step 3: Validate and get groupement ID
        IF LOWER(@groupement_name) NOT IN ('filiale', 'succursale')
        BEGIN
            SET @error_message = 'Groupement name must be either ''filiale'' or ''succursale''';
            THROW 50001, @error_message, 1;
        END
        
        -- Get the groupement ID based on the name
        SELECT @groupement_id = id 
        FROM Groupement 
        WHERE LOWER(name) = LOWER(@groupement_name) AND active = 1;
        
        IF @groupement_id IS NULL
        BEGIN
            SET @error_message = 'Groupement with name ''' + @groupement_name + ''' not found or inactive';
            THROW 50002, @error_message, 1;
        END
        
        -- Step 4: Validate that the site exists in the appropriate table
        IF LOWER(@groupement_name) = 'filiale'
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Filiale WHERE id = @site_id AND active = 1)
            BEGIN
                SET @error_message = 'Filiale with ID ' + CAST(@site_id AS VARCHAR) + ' not found or inactive';
                THROW 50003, @error_message, 1;
            END
        END
        ELSE IF LOWER(@groupement_name) = 'succursale'
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM Succursale WHERE id = @site_id AND active = 1)
            BEGIN
                SET @error_message = 'Succursale with ID ' + CAST(@site_id AS VARCHAR) + ' not found or inactive';
                THROW 50004, @error_message, 1;
            END
        END
        
        -- Step 5: Check if UserSite combination already exists and is active
        SELECT @usersite_id = id 
        FROM UserSite 
        WHERE idGroupement = @groupement_id 
          AND idSite = @site_id 
          AND active = 1;
        
        -- Step 6: Create or reuse UserSite entry
        IF @usersite_id IS NULL
        BEGIN
            -- Create new UserSite entry
            INSERT INTO UserSite (idGroupement, idSite, active)
            VALUES (@groupement_id, @site_id, 1);
            
            SET @usersite_id = SCOPE_IDENTITY();
        END
        -- If UserSite already exists and is active, we can reuse it
        -- Multiple users can share the same UserSite
        
        -- Step 7: Create the User
        INSERT INTO [User] (full_name, email, username, password, idUserSite, actif, active)
        VALUES (@full_name, @email, @username, @password, @usersite_id, 1, 1);
        
        SET @user_id = SCOPE_IDENTITY();
        
        -- Step 8: Assign Roles (if provided)
        IF @role_ids IS NOT NULL AND @role_ids != ''
        BEGIN
            DECLARE @role_table TABLE (role_id INT);
            
            -- Split comma-separated role IDs
            INSERT INTO @role_table (role_id)
            SELECT CAST(value AS INT)
            FROM STRING_SPLIT(@role_ids, ',')
            WHERE RTRIM(value) != '';
            
            -- Validate all roles exist and are active
            IF EXISTS (
                SELECT r.role_id 
                FROM @role_table r
                LEFT JOIN [Role] rol ON r.role_id = rol.id
                WHERE rol.id IS NULL OR rol.active = 0
            )
            BEGIN
                SET @error_message = 'One or more role IDs are invalid or inactive';
                THROW 50005, @error_message, 1;
            END
            
            -- Insert user roles (avoid duplicates)
            INSERT INTO UserRole (idUser, idRole, active)
            SELECT @user_id, role_id, 1
            FROM @role_table r
            WHERE NOT EXISTS (
                SELECT 1 FROM UserRole ur 
                WHERE ur.idUser = @user_id AND ur.idRole = r.role_id
            );
        END
        
        -- Step 9: Assign Permissions (if provided)
        IF @permission_ids IS NOT NULL AND @permission_ids != ''
        BEGIN
            DECLARE @permission_table TABLE (permission_id INT);
            
            -- Split comma-separated permission IDs
            INSERT INTO @permission_table (permission_id)
            SELECT CAST(value AS INT)
            FROM STRING_SPLIT(@permission_ids, ',')
            WHERE RTRIM(value) != '';
            
            -- Validate all permissions exist and are active
            IF EXISTS (
                SELECT p.permission_id 
                FROM @permission_table p
                LEFT JOIN Permission perm ON p.permission_id = perm.id
                WHERE perm.id IS NULL OR perm.active = 0
            )
            BEGIN
                SET @error_message = 'One or more permission IDs are invalid or inactive';
                THROW 50006, @error_message, 1;
            END
            
            -- Insert user permissions (avoid duplicates)
            INSERT INTO UserPermission (idUser, idPermission, active)
            SELECT @user_id, permission_id, 1
            FROM @permission_table p
            WHERE NOT EXISTS (
                SELECT 1 FROM UserPermission up 
                WHERE up.idUser = @user_id AND up.idPermission = p.permission_id
            );
        END
        
        -- Step 10: Log the action in AuditLog
        INSERT INTO AuditLog ([timestamp], module, objectId, [scope], userId, message, [action], description)
        VALUES (
            SYSUTCDATETIME(), 
            'UserManagement', 
            @user_id, 
            'User Creation', 
            CAST(@user_id AS VARCHAR), 
            'User created with roles and permissions', 
            'CREATE', 
            'User: ' + @username + ' created with site: ' + @groupement_name + ' (ID: ' + CAST(@site_id AS VARCHAR) + ')'
        );
        
        COMMIT TRANSACTION;
        
        -- Return success information
        SELECT 
            @user_id as UserId,
            @usersite_id as UserSiteId,
            'User created successfully' as Message,
            CASE 
                WHEN @usersite_id = SCOPE_IDENTITY() THEN 'New UserSite created'
                ELSE 'Existing UserSite reused'
            END as UserSiteStatus;
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Re-throw the error with more context
        DECLARE @error_number INT = ERROR_NUMBER();
        DECLARE @error_severity INT = ERROR_SEVERITY();
        DECLARE @error_state INT = ERROR_STATE();
        DECLARE @error_msg VARCHAR(MAX) = ERROR_MESSAGE();
        
        -- Add context for common constraint violations
        IF @error_msg LIKE '%UQ__User__F3DBC572FFE608D5%'
        BEGIN
            SET @error_msg = 'Username ''' + @username + ''' already exists. Please choose a different username.';
        END
        ELSE IF @error_msg LIKE '%UQ__User__AB6E6164E12E658F%'
        BEGIN
            SET @error_msg = 'Email ''' + @email + ''' already exists. Please use a different email address.';
        END
        
        RAISERROR(@error_msg, @error_severity, @error_state);
    END CATCH
END;

CREATE PROCEDURE dbo.sp_CreateUserWithSite
  @full_name  VARCHAR(255),
  @email      VARCHAR(255),
  @username   VARCHAR(100),
  @password   VARCHAR(255),
  @idGroupement INT,
  @idSite     INT,
  @actif      BIT = 1,
  @NewUserId  INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Validate Groupement exists and is active
    IF NOT EXISTS (SELECT 1 FROM dbo.Groupement WHERE id = @idGroupement AND active = 1)
    BEGIN
      RAISERROR('Groupement not found or inactive.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    -- Validate Site (Filiale or Succursale) exists and active
    IF NOT EXISTS (
      SELECT 1 FROM dbo.Filiale WHERE id = @idSite AND active = 1
      UNION
      SELECT 1 FROM dbo.Succursale WHERE id = @idSite AND active = 1
    )
    BEGIN
      RAISERROR('Site (Filiale or Succursale) not found or inactive.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    -- Create UserSite record
    INSERT INTO dbo.UserSite (idGroupement, idSite, active)
    VALUES (@idGroupement, @idSite, 1);

    DECLARE @NewUserSiteId INT = SCOPE_IDENTITY();

    -- Create user using existing procedure; assumes validity checks inside
    EXEC dbo.sp_CreateUser
      @full_name = @full_name,
      @email = @email,
      @username = @username,
      @password = @password,
      @idUserSite = @NewUserSiteId,
      @actif = @actif;

    -- Get the last inserted user id (the existing procedure returns it)
    SELECT @NewUserId = id FROM dbo.[User] WHERE username = @username;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;

CREATE PROCEDURE sp_DeactivateFiliale
    @id INT
AS
BEGIN
    UPDATE Filiale
    SET active = 0
    WHERE id = @id;
END;

CREATE PROCEDURE sp_DeactivateGroupement
    @id INT
AS
BEGIN
    UPDATE Groupement
    SET active = 0
    WHERE id = @id;
END;

CREATE PROCEDURE sp_DeactivateRole
    @id INT
AS
BEGIN
    UPDATE [Role]
    SET active = 0
    WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_DeactivateUserRole
    @idUser INT,
    @idRole INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE autohall.dbo.UserRole
    SET active = 0
    WHERE idUser = @idUser AND idRole = @idRole;
END;

CREATE PROCEDURE dbo.sp_DeactivateUserSite
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE autohall.dbo.UserSite SET active = 0 WHERE id = @id;
END;

CREATE PROCEDURE sp_DeleteGroupement
    @id INT
AS
BEGIN
    DELETE FROM Groupement
    WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_DeleteUserSite
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM autohall.dbo.UserSite WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_dropdiagram
	(
		@diagramname 	sysname,
		@owner_id	int	= null
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
	
		if(@diagramname is null)
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT; 
		
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		delete from dbo.sysdiagrams where diagram_id = @DiagId;
	
		return 0;
	END;

CREATE   PROCEDURE [dbo].[sp_GetAllFiliales]
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    -- Get paginated results with total count
    SELECT 
        id, 
        name, 
        active,
        COUNT(*) OVER() AS TotalRecords
    FROM Filiale
    ORDER BY id
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE sp_GetAllGroupements
AS
BEGIN
    SELECT id, name, active
    FROM Groupement
    ORDER BY id;
END;

CREATE PROCEDURE sp_GetAllRoles
AS
BEGIN
    SELECT id, name, description, active
    FROM [Role]
    ORDER BY id;
END;

CREATE PROCEDURE dbo.sp_GetAllUserSites
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        us.id,
        us.idGroupement,
        g.name AS groupement_name,
        us.idSite,
        COALESCE(f.name, s.name) AS site_name,
        CASE 
            WHEN f.id IS NOT NULL THEN 'Filiale'
            WHEN s.id IS NOT NULL THEN 'Succursale'
            ELSE 'Unknown'
        END AS site_type,
        us.active
    FROM autohall.dbo.UserSite us
    LEFT JOIN autohall.dbo.Groupement g ON g.id = us.idGroupement
    LEFT JOIN autohall.dbo.Filiale f ON f.id = us.idSite
    LEFT JOIN autohall.dbo.Succursale s ON s.id = us.idSite
    ORDER BY us.id;
END;

CREATE PROCEDURE sp_GetFilialeById
    @id INT
AS
BEGIN
    SELECT id, name, active
    FROM Filiale
    WHERE id = @id;
END;

CREATE PROCEDURE sp_GetGroupementById
    @id INT
AS
BEGIN
    SELECT id, name, active
    FROM Groupement
    WHERE id = @id;
END;

CREATE PROCEDURE sp_GetRoleById
    @id INT
AS
BEGIN
    SELECT id, name, description, active
    FROM [Role]
    WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_GetRolesByUser
    @idUser INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ur.idUser, ur.idRole, r.name AS role_name, ur.active
    FROM autohall.dbo.UserRole ur
    INNER JOIN autohall.dbo.[Role] r ON r.id = ur.idRole
    WHERE ur.idUser = @idUser
    ORDER BY ur.idRole;
END;

CREATE PROCEDURE sp_GetUserById
  @UserId INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1
    id,
    username,
    email,
    full_name,
    actif
  FROM dbo.[User]
  WHERE id = @UserId;
END;

CREATE PROCEDURE dbo.sp_GetUserSiteById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        us.id,
        us.idGroupement,
        g.name AS groupement_name,
        us.idSite,
        COALESCE(f.name, s.name) AS site_name,
        CASE 
            WHEN f.id IS NOT NULL THEN 'Filiale'
            WHEN s.id IS NOT NULL THEN 'Succursale'
            ELSE 'Unknown'
        END AS site_type,
        us.active
    FROM autohall.dbo.UserSite us
    LEFT JOIN autohall.dbo.Groupement g ON g.id = us.idGroupement
    LEFT JOIN autohall.dbo.Filiale f ON f.id = us.idSite
    LEFT JOIN autohall.dbo.Succursale s ON s.id = us.idSite
    WHERE us.id = @id;
END;

CREATE PROCEDURE dbo.sp_GetUserSitesByGroupement
    @idGroupement INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        us.id,
        us.idGroupement,
        g.name AS groupement_name,
        us.idSite,
        COALESCE(f.name, s.name) AS site_name,
        CASE 
            WHEN f.id IS NOT NULL THEN 'Filiale'
            WHEN s.id IS NOT NULL THEN 'Succursale'
            ELSE 'Unknown'
        END AS site_type,
        us.active
    FROM autohall.dbo.UserSite us
    LEFT JOIN autohall.dbo.Groupement g ON g.id = us.idGroupement
    LEFT JOIN autohall.dbo.Filiale f ON f.id = us.idSite
    LEFT JOIN autohall.dbo.Succursale s ON s.id = us.idSite
    WHERE us.idGroupement = @idGroupement
    ORDER BY us.id;
END;

CREATE PROCEDURE dbo.sp_GetUserSitesBySite
    @idSite INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        us.id,
        us.idGroupement,
        g.name AS groupement_name,
        us.idSite,
        COALESCE(f.name, s.name) AS site_name,
        CASE 
            WHEN f.id IS NOT NULL THEN 'Filiale'
            WHEN s.id IS NOT NULL THEN 'Succursale'
            ELSE 'Unknown'
        END AS site_type,
        us.active
    FROM autohall.dbo.UserSite us
    LEFT JOIN autohall.dbo.Groupement g ON g.id = us.idGroupement
    LEFT JOIN autohall.dbo.Filiale f ON f.id = us.idSite
    LEFT JOIN autohall.dbo.Succursale s ON s.id = us.idSite
    WHERE us.idSite = @idSite
    ORDER BY us.id;
END;

-- (Redundant helper; kept but consistent)
CREATE   PROCEDURE dbo.sp_Groupement_Create
  @Name   VARCHAR(255),
  @Active BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Groupement(name, active) VALUES (@Name, @Active);
  SELECT SCOPE_IDENTITY() AS newGroupementId;
END;

CREATE PROCEDURE dbo.sp_helpdiagramdefinition
	(
		@diagramname 	sysname,
		@owner_id	int	= null 		
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		set nocount on

		declare @theId 		int
		declare @IsDbo 		int
		declare @DiagId		int
		declare @UIDFound	int
	
		if(@diagramname is null)
		begin
			RAISERROR (N'E_INVALIDARG', 16, 1);
			return -1
		end
	
		execute as caller;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner');
		if(@owner_id is null)
			select @owner_id = @theId;
		revert; 
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname;
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId ))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1);
			return -3
		end

		select version, definition FROM dbo.sysdiagrams where diagram_id = @DiagId ; 
		return 0
	END;

CREATE PROCEDURE dbo.sp_helpdiagrams
	(
		@diagramname sysname = NULL,
		@owner_id int = NULL
	)
	WITH EXECUTE AS N'dbo'
	AS
	BEGIN
		DECLARE @user sysname
		DECLARE @dboLogin bit
		EXECUTE AS CALLER;
			SET @user = USER_NAME();
			SET @dboLogin = CONVERT(bit,IS_MEMBER('db_owner'));
		REVERT;
		SELECT
			[Database] = DB_NAME(),
			[Name] = name,
			[ID] = diagram_id,
			[Owner] = USER_NAME(principal_id),
			[OwnerID] = principal_id
		FROM
			sysdiagrams
		WHERE
			(@dboLogin = 1 OR USER_NAME(principal_id) = @user) AND
			(@diagramname IS NULL OR name = @diagramname) AND
			(@owner_id IS NULL OR principal_id = @owner_id)
		ORDER BY
			4, 5, 1
	END;

CREATE PROCEDURE sp_InsertFiliale
    @name VARCHAR(255),
    @active BIT = 1
AS
BEGIN
    INSERT INTO Filiale (name, active)
    VALUES (@name, @active);

    SELECT SCOPE_IDENTITY() AS NewId; -- return inserted id
END;

CREATE PROCEDURE sp_InsertGroupement
    @name VARCHAR(255),
    @active BIT = 1
AS
BEGIN
    INSERT INTO Groupement (name, active)
    VALUES (@name, @active);

    SELECT SCOPE_IDENTITY() AS NewId; -- return inserted id
END;

CREATE PROCEDURE sp_InsertRole
    @name VARCHAR(100),
    @description VARCHAR(500) = NULL,
    @active BIT = 1
AS
BEGIN
    BEGIN TRY
        INSERT INTO [Role] (name, description, active)
        VALUES (@name, @description, @active);

        SELECT SCOPE_IDENTITY() AS NewId; -- return inserted id
    END TRY
    BEGIN CATCH
        -- Handle unique name constraint error
        IF ERROR_NUMBER() = 2627 
            RAISERROR('Role name must be unique.', 16, 1);
        ELSE
            THROW;
    END CATCH
END;

CREATE PROCEDURE dbo.sp_InsertUserSite
    @idGroupement INT,
    @idSite INT,
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.Groupement g WHERE g.id = @idGroupement)
    BEGIN
        RAISERROR('Groupement id %d does not exist.', 16, 1, @idGroupement);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.Filiale f WHERE f.id = @idSite)
       AND NOT EXISTS (SELECT 1 FROM autohall.dbo.Succursale s WHERE s.id = @idSite)
    BEGIN
        RAISERROR('idSite %d does not exist in Filiale or Succursale.', 16, 1, @idSite);
        RETURN;
    END;

    INSERT INTO autohall.dbo.UserSite (idGroupement, idSite, active)
    VALUES (@idGroupement, @idSite, @active);

    SELECT SCOPE_IDENTITY() AS NewId;
END;

CREATE PROCEDURE dbo.sp_Marque_Activate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id = @Id)
  BEGIN RAISERROR('Marque not found.', 16, 1); RETURN; END;

  UPDATE dbo.Marque SET active = 1 WHERE id = @Id;

  SELECT id, name, idFiliale, imageUrl, active FROM dbo.Marque WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Marque_Create
  @Name            VARCHAR(255),
  @IdFiliale       INT,
  @ImageUrl        VARCHAR(500) = NULL,
  @Active          BIT = 1,
  @NewMarqueId     INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- Make sure the filiale exists
  IF NOT EXISTS (SELECT 1 FROM dbo.Filiale WHERE id = @IdFiliale AND active = 1)
  BEGIN
      RAISERROR('Filiale not found or inactive.', 16, 1);
      RETURN;
  END;

  INSERT INTO dbo.Marque (name, idFiliale, imageUrl, active)
  VALUES (@Name, @IdFiliale, @ImageUrl, @Active);

  SET @NewMarqueId = CONVERT(INT, SCOPE_IDENTITY());
END;

CREATE PROCEDURE dbo.sp_Marque_Deactivate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id = @Id)
  BEGIN RAISERROR('Marque not found.', 16, 1); RETURN; END;

  UPDATE dbo.Marque SET active = 0 WHERE id = @Id;

  SELECT id, name, idFiliale, imageUrl, active FROM dbo.Marque WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Marque_GetById
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, name, idFiliale, imageUrl, active FROM dbo.Marque WHERE id = @Id;
END;

CREATE PROCEDURE [dbo].[sp_Marque_List]
  @IdFiliale  INT = NULL,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    id, 
    name, 
    idFiliale,
    imageUrl,
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Marque
  WHERE (@IdFiliale IS NULL OR idFiliale = @IdFiliale)
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE [dbo].[sp_Marque_ListByFiliale]
  @IdFiliale INT,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    id, 
    name, 
    idFiliale,
    imageUrl,
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Marque
  WHERE idFiliale = @IdFiliale
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE [dbo].[sp_Marque_Search]
  @q          VARCHAR(255),
  @IdFiliale  INT = NULL,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    id, 
    name, 
    idFiliale,
    imageUrl,
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Marque
  WHERE name LIKE '%' + @q + '%'
    AND (@IdFiliale IS NULL OR idFiliale = @IdFiliale)
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE dbo.sp_Marque_Update
  @Id        INT,
  @Name      VARCHAR(255) = NULL,
  @IdFiliale INT          = NULL,
  @ImageUrl  VARCHAR(500) = NULL,
  @Active    BIT          = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id = @Id)
  BEGIN
      RAISERROR('Marque not found.', 16, 1);
      RETURN;
  END;

  -- If filiale is changing, verify it exists
  IF @IdFiliale IS NOT NULL
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM dbo.Filiale WHERE id = @IdFiliale AND active = 1)
      BEGIN
          RAISERROR('Target filiale not found or inactive.', 16, 1);
          RETURN;
      END;
  END;

  UPDATE m
  SET name      = COALESCE(@Name, m.name),
      idFiliale = COALESCE(@IdFiliale, m.idFiliale),
      imageUrl  = COALESCE(@ImageUrl, m.imageUrl),
      active    = COALESCE(@Active, m.active)
  FROM dbo.Marque m
  WHERE m.id = @Id;

  SELECT id, name, idFiliale, imageUrl, active FROM dbo.Marque WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Modele_Activate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @Id)
  BEGIN RAISERROR('Modele not found.', 16, 1); RETURN; END;

  UPDATE dbo.Modele SET active = 1 WHERE id = @Id;

  SELECT id, name, idMarque, imageUrl, active FROM dbo.Modele WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Modele_Create
  @Name            VARCHAR(255),
  @IdMarque        INT,
  @ImageUrl        VARCHAR(500) = NULL,
  @Active          BIT = 1,
  @NewModeleId     INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- friendly check for marque existence/active
  IF NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id = @IdMarque AND active = 1)
  BEGIN
      RAISERROR('Marque not found or inactive.', 16, 1);
      RETURN;
  END;

  INSERT INTO dbo.Modele (name, idMarque, imageUrl, active)
  VALUES (@Name, @IdMarque, @ImageUrl, @Active);

  SET @NewModeleId = CONVERT(INT, SCOPE_IDENTITY());
END;

CREATE PROCEDURE dbo.sp_Modele_Deactivate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @Id)
  BEGIN RAISERROR('Modele not found.', 16, 1); RETURN; END;

  UPDATE dbo.Modele SET active = 0 WHERE id = @Id;

  SELECT id, name, idMarque, imageUrl, active FROM dbo.Modele WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Modele_Delete
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @Id)
  BEGIN RAISERROR('Modele not found.', 16, 1); RETURN; END;

  IF EXISTS (SELECT 1 FROM dbo.[Version] WHERE idModele = @Id)
  BEGIN RAISERROR('Cannot delete: referenced by Version.', 16, 1); RETURN; END;

  DELETE FROM dbo.Modele WHERE id = @Id;

  SELECT @Id AS DeletedId, 'Modele deleted' AS Message;
END;

CREATE PROCEDURE dbo.sp_Modele_GetById
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, name, idMarque, imageUrl, active FROM dbo.Modele WHERE id = @Id;
END;

CREATE PROCEDURE [dbo].[sp_Modele_List]
  @IdMarque  INT = NULL,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with marque name and total count
  SELECT 
    m.id, 
    m.name, 
    m.idMarque, 
    m.imageUrl,
    ma.name AS marqueName,
    m.active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Modele AS m
  INNER JOIN dbo.Marque AS ma ON m.idMarque = ma.id
  WHERE (@IdMarque IS NULL OR m.idMarque = @IdMarque)
    AND (@OnlyActive = 0 OR m.active = 1)
  ORDER BY m.name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE [dbo].[sp_Modele_ListByMarque]
  @IdMarque  INT,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with marque name and total count
  SELECT 
    m.id, 
    m.name, 
    m.idMarque, 
    m.imageUrl,
    ma.name AS marqueName,
    m.active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Modele AS m
  INNER JOIN dbo.Marque AS ma ON m.idMarque = ma.id
  WHERE m.idMarque = @IdMarque
    AND (@OnlyActive = 0 OR m.active = 1)
  ORDER BY m.name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE [dbo].[sp_Modele_Search]
  @q         VARCHAR(255),
  @IdMarque  INT = NULL,
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    id, 
    name, 
    idMarque,
    imageUrl,
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Modele
  WHERE name LIKE '%' + @q + '%'
    AND (@IdMarque IS NULL OR idMarque = @IdMarque)
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE dbo.sp_Modele_Update
  @Id       INT,
  @Name     VARCHAR(255) = NULL,
  @IdMarque INT          = NULL,
  @ImageUrl VARCHAR(500) = NULL,
  @Active   BIT          = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @Id)
  BEGIN
      RAISERROR('Modele not found.', 16, 1);
      RETURN;
  END;

  -- If changing marque, ensure it exists and is active
  IF @IdMarque IS NOT NULL
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id = @IdMarque AND active = 1)
      BEGIN
          RAISERROR('Target marque not found or inactive.', 16, 1);
          RETURN;
      END;
  END;

  UPDATE m
  SET name     = COALESCE(@Name, m.name),
      idMarque = COALESCE(@IdMarque, m.idMarque),
      imageUrl = COALESCE(@ImageUrl, m.imageUrl),
      active   = COALESCE(@Active, m.active)
  FROM dbo.Modele m
  WHERE m.id = @Id;

  SELECT id, name, idMarque, imageUrl, active FROM dbo.Modele WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_Objectif_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Objectif WHERE id=@id)
    THROW 54029, 'Objectif id not found.', 1;

  UPDATE dbo.Objectif
  SET active = 1
  WHERE id = @id;

  SELECT *
  FROM dbo.Objectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_Objectif_Create
  @userId           int,
  @groupementId     int,
  @siteId           int,
  @periodeId        int,
  @typeVenteId      int,
  @typeObjectifId   int,
  @marqueId         int = NULL,
  @modeleId         int = NULL,
  @versionId        int = NULL,
  @volume           int,
  @SalePrice        decimal(18,2),
  @TMDirect         decimal(5,4),
  @MargeInterGroupe decimal(5,4),
  @newId            int OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- Required basics
  IF @userId IS NULL OR @groupementId IS NULL OR @siteId IS NULL OR @periodeId IS NULL
     OR @typeVenteId IS NULL OR @typeObjectifId IS NULL
    THROW 54001, 'Required fields are missing.', 1;

  -- Caps
  IF @TMDirect > 0.40
    THROW 54002, 'TMDirect must be <= 0.40.', 1;
  IF @MargeInterGroupe > 0.40
    THROW 54003, 'MargeInterGroupe must be <= 0.40.', 1;

  -- At least one product level
  IF @marqueId IS NULL AND @modeleId IS NULL AND @versionId IS NULL
    THROW 54004, 'Provide at least one of marqueId, modeleId, or versionId.', 1;

  -- FK existence checks (friendly errors; FKs will also enforce)
  IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id=@userId)
    THROW 54005, 'Invalid userId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.Groupement WHERE id=@groupementId)
    THROW 54006, 'Invalid groupementId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.Periode WHERE id=@periodeId AND active=1)
    THROW 54007, 'Invalid or inactive periodeId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.TypeVente WHERE id=@typeVenteId AND active=1)
    THROW 54008, 'Invalid or inactive typeVenteId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE id=@typeObjectifId AND active=1)
    THROW 54009, 'Invalid or inactive typeObjectifId.', 1;

  -- Product existence
  IF @marqueId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id=@marqueId AND active=1)
    THROW 54010, 'Invalid or inactive marqueId.', 1;
  IF @modeleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id=@modeleId AND active=1)
    THROW 54011, 'Invalid or inactive modeleId.', 1;
  IF @versionId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Version WHERE id=@versionId AND active=1)
    THROW 54012, 'Invalid or inactive versionId.', 1;

  -- Hierarchy consistency: Version -> Modele -> Marque
  IF @versionId IS NOT NULL
  BEGIN
    DECLARE @vModeleId int;
    SELECT @vModeleId = v.idModele FROM dbo.Version v WHERE v.id=@versionId;
    IF @modeleId IS NOT NULL AND @modeleId <> @vModeleId
      THROW 54013, 'versionId does not belong to specified modeleId.', 1;
    SET @modeleId = ISNULL(@modeleId, @vModeleId);
  END

  IF @modeleId IS NOT NULL
  BEGIN
    DECLARE @mMarqueId int;
    SELECT @mMarqueId = mo.idMarque FROM dbo.Modele mo WHERE mo.id=@modeleId;
    IF @marqueId IS NOT NULL AND @marqueId <> @mMarqueId
      THROW 54014, 'modeleId does not belong to specified marqueId.', 1;
    SET @marqueId = ISNULL(@marqueId, @mMarqueId);
  END

  INSERT INTO dbo.Objectif
  (
    userId, groupementId, siteId, periodeId,
    marqueId, modeleId, versionId,
    typeVenteId, typeObjectifId,
    volume, SalePrice, TMDirect, MargeInterGroupe,
    createdAt, active
  )
  VALUES
  (
    @userId, @groupementId, @siteId, @periodeId,
    @marqueId, @modeleId, @versionId,
    @typeVenteId, @typeObjectifId,
    @volume, @SalePrice, @TMDirect, @MargeInterGroupe,
    SYSUTCDATETIME(), 1
  );

  SET @newId = SCOPE_IDENTITY();

  SELECT *
  FROM dbo.Objectif
  WHERE id = @newId;
END;

CREATE PROCEDURE dbo.sp_Objectif_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Objectif WHERE id=@id)
    THROW 54030, 'Objectif id not found.', 1;

  UPDATE dbo.Objectif
  SET active = 0
  WHERE id = @id;

  SELECT *
  FROM dbo.Objectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_Objectif_GetByIdActive
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT *
  FROM dbo.Objectif
  WHERE id = @id AND active = 1;
END;

CREATE   PROCEDURE [dbo].[sp_Objectif_ListActive]
  @userId       INT = NULL,
  @periodeId    INT = NULL,
  @groupementId INT = NULL,
  @siteId       INT = NULL,
  @pageNumber   INT = 1,
  @pageSize     INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Get paginated results with total count
  SELECT 
    *,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Objectif o
  WHERE o.active = 1
    AND (@userId IS NULL OR o.userId = @userId)
    AND (@periodeId IS NULL OR o.periodeId = @periodeId)
    AND (@groupementId IS NULL OR o.groupementId = @groupementId)
    AND (@siteId IS NULL OR o.siteId = @siteId)
  ORDER BY o.periodeId DESC, o.userId ASC, o.id DESC
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE dbo.sp_Objectif_Update
  @id               int,
  @userId           int,
  @groupementId     int,
  @siteId           int,
  @periodeId        int,
  @typeVenteId      int,
  @typeObjectifId   int,
  @marqueId         int = NULL,
  @modeleId         int = NULL,
  @versionId        int = NULL,
  @volume           int,
  @SalePrice        decimal(18,2),
  @TMDirect         decimal(5,4),
  @MargeInterGroupe decimal(5,4),
  @updatedUserId    int = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Objectif WHERE id=@id)
    THROW 54015, 'Objectif id not found.', 1;

  IF @TMDirect > 0.40
    THROW 54016, 'TMDirect must be <= 0.40.', 1;
  IF @MargeInterGroupe > 0.40
    THROW 54017, 'MargeInterGroupe must be <= 0.40.', 1;

  IF @marqueId IS NULL AND @modeleId IS NULL AND @versionId IS NULL
    THROW 54018, 'Provide at least one of marqueId, modeleId, or versionId.', 1;

  -- FK existence (friendly)
  IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id=@userId)
    THROW 54019, 'Invalid userId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.Groupement WHERE id=@groupementId)
    THROW 54020, 'Invalid groupementId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.Periode WHERE id=@periodeId AND active=1)
    THROW 54021, 'Invalid or inactive periodeId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.TypeVente WHERE id=@typeVenteId AND active=1)
    THROW 54022, 'Invalid or inactive typeVenteId.', 1;
  IF NOT EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE id=@typeObjectifId AND active=1)
    THROW 54023, 'Invalid or inactive typeObjectifId.', 1;

  -- Product existence
  IF @marqueId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Marque WHERE id=@marqueId AND active=1)
    THROW 54024, 'Invalid or inactive marqueId.', 1;
  IF @modeleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id=@modeleId AND active=1)
    THROW 54025, 'Invalid or inactive modeleId.', 1;
  IF @versionId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Version WHERE id=@versionId AND active=1)
    THROW 54026, 'Invalid or inactive versionId.', 1;

  -- Hierarchy consistency: Version -> Modele -> Marque
  IF @versionId IS NOT NULL
  BEGIN
    DECLARE @vModeleId2 int;
    SELECT @vModeleId2 = v.idModele FROM dbo.Version v WHERE v.id=@versionId;
    IF @modeleId IS NOT NULL AND @modeleId <> @vModeleId2
      THROW 54027, 'versionId does not belong to specified modeleId.', 1;
    SET @modeleId = ISNULL(@modeleId, @vModeleId2);
  END

  IF @modeleId IS NOT NULL
  BEGIN
    DECLARE @mMarqueId2 int;
    SELECT @mMarqueId2 = mo.idMarque FROM dbo.Modele mo WHERE mo.id=@modeleId;
    IF @marqueId IS NOT NULL AND @marqueId <> @mMarqueId2
      THROW 54028, 'modeleId does not belong to specified marqueId.', 1;
    SET @marqueId = ISNULL(@marqueId, @mMarqueId2);
  END

  UPDATE dbo.Objectif
  SET userId = @userId,
      groupementId = @groupementId,
      siteId = @siteId,
      periodeId = @periodeId,
      marqueId = @marqueId,
      modeleId = @modeleId,
      versionId = @versionId,
      typeVenteId = @typeVenteId,
      typeObjectifId = @typeObjectifId,
      volume = @volume,
      SalePrice = @SalePrice,
      TMDirect = @TMDirect,
      MargeInterGroupe = @MargeInterGroupe,
      updatedAt = SYSUTCDATETIME(),
      updatedUserId = @updatedUserId
  WHERE id = @id;

  SELECT *
  FROM dbo.Objectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_Periode_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Periode WHERE id = @id)
    THROW 51019, 'Periode id not found.', 1;

  UPDATE dbo.Periode
  SET active = 1
  WHERE id = @id;

  SELECT id, [year], [month], week, startedDate, endDate, typePeriodeId, active
  FROM dbo.Periode
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_Periode_Create
  @year          int,
  @month         int,
  @week          int,            -- 0 = mensuel, >0 = hebdomadaire
  @startedDate   date,
  @endDate       date,
  @typePeriodeId int = NULL,     -- if NULL, auto-resolve by @week
  @newId         int OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- Basic validation
  IF @year IS NULL OR @month IS NULL OR @week IS NULL
    THROW 51001, 'year, month, week are required.', 1;

  IF @month < 1 OR @month > 12
    THROW 51002, 'month must be between 1 and 12.', 1;

  IF @week < 0
    THROW 51003, 'week must be >= 0.', 1;

  IF @startedDate IS NULL OR @endDate IS NULL
    THROW 51004, 'startedDate and endDate are required.', 1;

  IF @startedDate > @endDate
    THROW 51005, 'startedDate must be <= endDate.', 1;

  -- Uniqueness check
  IF EXISTS (
    SELECT 1 FROM dbo.Periode
    WHERE [year]=@year AND [month]=@month AND [week]=@week
  )
    THROW 51006, 'A Periode with the same (year, month, week) already exists.', 1;

  -- Resolve or validate typePeriodeId against week rule
  DECLARE @mensuelId int = (
    SELECT TOP(1) id FROM dbo.TypePeriode
    WHERE active=1 AND mensuel=1
    ORDER BY id
  );

  DECLARE @hebdoId int = (
    SELECT TOP(1) id FROM dbo.TypePeriode
    WHERE active=1 AND hebdomadaire=1
    ORDER BY id
  );

  IF @week = 0
  BEGIN
    IF @typePeriodeId IS NULL SET @typePeriodeId = @mensuelId;
    IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id=@typePeriodeId AND mensuel=1 AND active=1)
      THROW 51007, 'typePeriodeId must be a mensuel type when week=0.', 1;
  END
  ELSE
  BEGIN
    IF @typePeriodeId IS NULL SET @typePeriodeId = @hebdoId;
    IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id=@typePeriodeId AND hebdomadaire=1 AND active=1)
      THROW 51008, 'typePeriodeId must be a hebdomadaire type when week>0.', 1;
  END

  -- Insert
  INSERT INTO dbo.Periode
    ([year],[month],week,startedDate,endDate,typePeriodeId,active)
  VALUES
    (@year,@month,@week,@startedDate,@endDate,@typePeriodeId,1);

  SET @newId = SCOPE_IDENTITY();

  -- Return inserted row
  SELECT id, [year], [month], week, startedDate, endDate, typePeriodeId, active
  FROM dbo.Periode
  WHERE id = @newId;
END;

CREATE PROCEDURE dbo.sp_Periode_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Periode WHERE id = @id)
    THROW 51020, 'Periode id not found.', 1;

  UPDATE dbo.Periode
  SET active = 0
  WHERE id = @id;

  SELECT id, [year], [month], week, startedDate, endDate, typePeriodeId, active
  FROM dbo.Periode
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_Periode_GetByIdActive
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, [year], [month], week, startedDate, endDate, typePeriodeId, active
  FROM dbo.Periode
  WHERE id = @id AND active = 1;

  -- Optional strict mode:
  -- IF @@ROWCOUNT = 0 THROW 51018, 'Active Periode not found.', 1;
END;

CREATE     PROCEDURE [dbo].[sp_Periode_ListActive]
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Get paginated results with total count
  SELECT 
    id, 
    [year], 
    [month], 
    week, 
    startedDate, 
    endDate, 
    typePeriodeId, 
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Periode
  ORDER BY [year] DESC, [month] DESC, week ASC
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[sp_Periode_ListByType]
  @typePeriodeId   INT = NULL,
  @typePeriodeName VARCHAR(50) = NULL,
  @hebdomadaire    BIT = NULL,
  @mensuel         BIT = NULL,
  @year            INT = NULL,
  @month           INT = NULL,
  @pageNumber      INT = 1,
  @pageSize        INT = 10
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @resolvedTypeId INT = NULL;

  -- Resolve by id
  IF @typePeriodeId IS NOT NULL
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id=@typePeriodeId AND active=1)
      THROW 51101, 'Invalid or inactive typePeriodeId.', 1;
    SET @resolvedTypeId = @typePeriodeId;
  END
  ELSE IF NULLIF(LTRIM(RTRIM(@typePeriodeName)),'') IS NOT NULL
  BEGIN
    SELECT @resolvedTypeId = id
    FROM dbo.TypePeriode
    WHERE name = @typePeriodeName AND active=1;

    IF @resolvedTypeId IS NULL
      THROW 51102, 'TypePeriode name not found or inactive.', 1;
  END
  ELSE
  BEGIN
    -- Resolve by flags: exactly one must be 1
    IF (COALESCE(CAST(@hebdomadaire AS INT),0) + COALESCE(CAST(@mensuel AS INT),0)) <> 1
      THROW 51103, 'Provide exactly one of @hebdomadaire or @mensuel when id/name is not supplied.', 1;

    IF ISNULL(@hebdomadaire,0) = 1
    BEGIN
      SELECT TOP(1) @resolvedTypeId = id
      FROM dbo.TypePeriode
      WHERE active=1 AND hebdomadaire=1
      ORDER BY id;
      IF @resolvedTypeId IS NULL
        THROW 51104, 'No active hebdomadaire TypePeriode found.', 1;
    END
    ELSE
    BEGIN
      SELECT TOP(1) @resolvedTypeId = id
      FROM dbo.TypePeriode
      WHERE active=1 AND mensuel=1
      ORDER BY id;
      IF @resolvedTypeId IS NULL
        THROW 51105, 'No active mensuel TypePeriode found.', 1;
    END
  END
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Return only active periodes with pagination
  SELECT
    p.id, 
    p.[year], 
    p.[month], 
    p.week,
    p.startedDate, 
    p.endDate, 
    p.typePeriodeId, 
    p.active,
    p.name,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Periode p
  WHERE p.active = 1
    AND p.typePeriodeId = @resolvedTypeId
    AND (@year  IS NULL OR p.[year]  = @year)
    AND (@month IS NULL OR p.[month] = @month)
  ORDER BY p.[year] DESC, p.[month] DESC, p.week ASC
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[sp_Periode_ListByYear]
  @year INT,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;

  IF @year IS NULL
    THROW 51110, 'year is required.', 1;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;

  -- Get paginated results with total count
  SELECT
    p.id,
    p.[year],
    p.[month],
    p.week,
    p.startedDate,
    p.endDate,
    p.typePeriodeId,
    p.active,
    p.name,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Periode p
  WHERE p.active = 1
    AND p.[year] = @year
  ORDER BY p.[month] DESC, p.week ASC
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[sp_Periode_ListYears]
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    [year],
    COUNT(*) OVER() AS TotalRecords
  FROM (
    SELECT DISTINCT [year]
    FROM dbo.Periode
    WHERE active = 1
  ) AS DistinctYears
  ORDER BY [year] DESC
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE PROCEDURE dbo.sp_Periode_Update
  @id            int,
  @year          int,
  @month         int,
  @week          int,
  @startedDate   date,
  @endDate       date,
  @typePeriodeId int = NULL      -- if NULL, auto-resolve by @week
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Periode WHERE id=@id)
    THROW 51009, 'Periode id not found.', 1;

  IF @year IS NULL OR @month IS NULL OR @week IS NULL
    THROW 51010, 'year, month, week are required.', 1;

  IF @month < 1 OR @month > 12
    THROW 51011, 'month must be between 1 and 12.', 1;

  IF @week < 0
    THROW 51012, 'week must be >= 0.', 1;

  IF @startedDate IS NULL OR @endDate IS NULL
    THROW 51013, 'startedDate and endDate are required.', 1;

  IF @startedDate > @endDate
    THROW 51014, 'startedDate must be <= endDate.', 1;

  -- Uniqueness (exclude self)
  IF EXISTS (
    SELECT 1 FROM dbo.Periode
    WHERE [year]=@year AND [month]=@month AND [week]=@week AND id<>@id
  )
    THROW 51015, 'Another Periode with the same (year, month, week) already exists.', 1;

  -- Resolve or validate typePeriodeId against week rule
  DECLARE @mensuelId int = (
    SELECT TOP(1) id FROM dbo.TypePeriode
    WHERE active=1 AND mensuel=1
    ORDER BY id
  );

  DECLARE @hebdoId int = (
    SELECT TOP(1) id FROM dbo.TypePeriode
    WHERE active=1 AND hebdomadaire=1
    ORDER BY id
  );

  IF @week = 0
  BEGIN
    IF @typePeriodeId IS NULL SET @typePeriodeId = @mensuelId;
    IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id=@typePeriodeId AND mensuel=1 AND active=1)
      THROW 51016, 'typePeriodeId must be a mensuel type when week=0.', 1;
  END
  ELSE
  BEGIN
    IF @typePeriodeId IS NULL SET @typePeriodeId = @hebdoId;
    IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id=@typePeriodeId AND hebdomadaire=1 AND active=1)
      THROW 51017, 'typePeriodeId must be a hebdomadaire type when week>0.', 1;
  END

  UPDATE dbo.Periode
  SET [year] = @year,
      [month] = @month,
      week = @week,
      startedDate = @startedDate,
      endDate = @endDate,
      typePeriodeId = @typePeriodeId
  WHERE id = @id;

  SELECT id, [year], [month], week, startedDate, endDate, typePeriodeId, active
  FROM dbo.Periode
  WHERE id = @id;
END;

-- Permission create (unique name)
CREATE   PROCEDURE dbo.sp_Permission_Create
  @Name            VARCHAR(150),
  @Active          BIT = 1,
  @NewPermissionId INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM dbo.Permission WHERE name = @Name)
  BEGIN
    RAISERROR('Permission with this name already exists.', 16, 1);
    RETURN;
  END;

  INSERT INTO dbo.Permission (name, active)
  VALUES (@Name, @Active);

  SET @NewPermissionId = CONVERT(INT, SCOPE_IDENTITY());
END;

CREATE   PROCEDURE dbo.sp_ProductHierarchy_UpsertJson
  @payload   NVARCHAR(MAX),
  @FilialeId INT OUTPUT,
  @MarqueId  INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRAN;

    -- Filiale
    DECLARE @FilialeName VARCHAR(255), @FilialeActive BIT;
    SELECT @FilialeName = j.name, @FilialeActive = ISNULL(j.active, 1)
    FROM OPENJSON(@payload, '$.filiale')
    WITH (name VARCHAR(255) '$.name', active BIT '$.active') AS j;

    IF @FilialeName IS NULL
    BEGIN
      RAISERROR('filiale.name is required in payload', 16, 1);
      ROLLBACK TRAN;
      RETURN;
    END;

    SELECT @FilialeId = id FROM dbo.Filiale WHERE name = @FilialeName;

    IF @FilialeId IS NULL
    BEGIN
      INSERT INTO dbo.Filiale(name, active) VALUES (@FilialeName, ISNULL(@FilialeActive, 1));
      SET @FilialeId = CONVERT(INT, SCOPE_IDENTITY());
    END
    ELSE
    BEGIN
      IF @FilialeActive IS NOT NULL
        UPDATE dbo.Filiale SET active = @FilialeActive WHERE id = @FilialeId;
    END;

    -- Marque
    DECLARE @MarqueName VARCHAR(255), @MarqueActive BIT;
    SELECT @MarqueName = j.name, @MarqueActive = ISNULL(j.active, 1)
    FROM OPENJSON(@payload, '$.marque')
    WITH (name VARCHAR(255) '$.name', active BIT '$.active') AS j;

    IF @MarqueName IS NULL
    BEGIN
      RAISERROR('marque.name is required in payload', 16, 1);
      ROLLBACK TRAN;
      RETURN;
    END;

    SELECT @MarqueId = id
    FROM dbo.Marque
    WHERE name = @MarqueName AND idFiliale = @FilialeId;

    IF @MarqueId IS NULL
    BEGIN
      INSERT INTO dbo.Marque(name, idFiliale, active)
      VALUES (@MarqueName, @FilialeId, ISNULL(@MarqueActive, 1));
      SET @MarqueId = CONVERT(INT, SCOPE_IDENTITY());
    END
    ELSE
    BEGIN
      IF @MarqueActive IS NOT NULL
        UPDATE dbo.Marque SET active = @MarqueActive WHERE id = @MarqueId;
    END;

    -- Parse modeles and their nested versions
    DECLARE @Modeles TABLE(name VARCHAR(255) NOT NULL, active BIT NULL, versions NVARCHAR(MAX) NULL);
    INSERT INTO @Modeles(name, active, versions)
    SELECT m.name, m.active, m.versions
    FROM OPENJSON(@payload, '$.modeles')
    WITH (
      name     VARCHAR(255) '$.name',
      active   BIT          '$.active',
      versions NVARCHAR(MAX) '$.versions' AS JSON
    ) AS m;

    -- Upsert modeles (insert new)
    INSERT INTO dbo.Modele(name, idMarque, active)
    SELECT m.name, @MarqueId, ISNULL(m.active, 1)
    FROM @Modeles m
    LEFT JOIN dbo.Modele mo
      ON mo.name = m.name AND mo.idMarque = @MarqueId
    WHERE mo.id IS NULL;

    -- Upsert modeles (update active when provided)
    UPDATE mo
      SET mo.active = ISNULL(m.active, mo.active)
    FROM dbo.Modele mo
    JOIN @Modeles m
      ON m.name = mo.name AND mo.idMarque = @MarqueId;

    -- Map modeles to ids for version upserts
    DECLARE @ModelesMap TABLE(modele_id INT PRIMARY KEY, name VARCHAR(255) NOT NULL);
    INSERT INTO @ModelesMap(modele_id, name)
    SELECT mo.id, mo.name
    FROM dbo.Modele mo
    WHERE mo.idMarque = @MarqueId
      AND EXISTS (SELECT 1 FROM @Modeles m WHERE m.name = mo.name);

    -- Flatten versions with parent modele name
    DECLARE @Versions TABLE(modele_name VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, active BIT NULL);
    INSERT INTO @Versions(modele_name, name, active)
    SELECT m.name AS modele_name, v.name, v.active
    FROM @Modeles m
    CROSS APPLY OPENJSON(m.versions)
      WITH (name VARCHAR(255) '$.name', active BIT '$.active') AS v;

    -- Upsert versions (insert new)
    INSERT INTO dbo.[Version](name, idModele, active)
    SELECT v.name, mm.modele_id, ISNULL(v.active, 1)
    FROM @Versions v
    JOIN @ModelesMap mm ON mm.name = v.modele_name
    LEFT JOIN dbo.[Version] dv
      ON dv.name = v.name AND dv.idModele = mm.modele_id
    WHERE dv.id IS NULL;

    -- Upsert versions (update active when provided)
    UPDATE dv
      SET dv.active = ISNULL(v.active, dv.active)
    FROM dbo.[Version] dv
    JOIN @ModelesMap mm ON mm.modele_id = dv.idModele
    JOIN @Versions v ON v.modele_name = mm.name AND v.name = dv.name;

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    DECLARE @ErrMsg NVARCHAR(2048) = ERROR_MESSAGE(), @ErrSev INT = ERROR_SEVERITY(), @ErrState INT = ERROR_STATE();
    RAISERROR(@ErrMsg, @ErrSev, @ErrState);
  END CATCH
END;

CREATE PROCEDURE dbo.sp_RemoveUserRole
    @idUser INT,
    @idRole INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM autohall.dbo.UserRole
    WHERE idUser = @idUser AND idRole = @idRole;
END;

CREATE PROCEDURE dbo.sp_renamediagram
	(
		@diagramname 		sysname,
		@owner_id		int	= null,
		@new_diagramname	sysname
	
	)
	WITH EXECUTE AS 'dbo'
	AS
	BEGIN
		set nocount on
		declare @theId 			int
		declare @IsDbo 			int
		
		declare @UIDFound 		int
		declare @DiagId			int
		declare @DiagIdTarg		int
		declare @u_name			sysname
		if((@diagramname is null) or (@new_diagramname is null))
		begin
			RAISERROR ('Invalid value', 16, 1);
			return -1
		end
	
		EXECUTE AS CALLER;
		select @theId = DATABASE_PRINCIPAL_ID();
		select @IsDbo = IS_MEMBER(N'db_owner'); 
		if(@owner_id is null)
			select @owner_id = @theId;
		REVERT;
	
		select @u_name = USER_NAME(@owner_id)
	
		select @DiagId = diagram_id, @UIDFound = principal_id from dbo.sysdiagrams where principal_id = @owner_id and name = @diagramname 
		if(@DiagId IS NULL or (@IsDbo = 0 and @UIDFound <> @theId))
		begin
			RAISERROR ('Diagram does not exist or you do not have permission.', 16, 1)
			return -3
		end
	
		-- if((@u_name is not null) and (@new_diagramname = @diagramname))	-- nothing will change
		--	return 0;
	
		if(@u_name is null)
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @theId and name = @new_diagramname
		else
			select @DiagIdTarg = diagram_id from dbo.sysdiagrams where principal_id = @owner_id and name = @new_diagramname
	
		if((@DiagIdTarg is not null) and  @DiagId <> @DiagIdTarg)
		begin
			RAISERROR ('The name is already used.', 16, 1);
			return -2
		end		
	
		if(@u_name is null)
			update dbo.sysdiagrams set [name] = @new_diagramname, principal_id = @theId where diagram_id = @DiagId
		else
			update dbo.sysdiagrams set [name] = @new_diagramname where diagram_id = @DiagId
		return 0
	END;

-- ================================================
-- RolePermission Stored Procedures
-- ================================================

-- Assign permission to role (or reactivate)
CREATE   PROCEDURE sp_RolePermission_Assign
    @idRole INT,
    @idPermission INT,
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if role exists
    IF NOT EXISTS (SELECT 1 FROM [Role] WHERE id = @idRole)
        THROW 50000, 'Role not found', 1;
    
    -- Check if permission exists
    IF NOT EXISTS (SELECT 1 FROM Permission WHERE id = @idPermission)
        THROW 50001, 'Permission not found', 1;
    
    -- Insert or update
    IF EXISTS (SELECT 1 FROM RolePermission WHERE idRole = @idRole AND idPermission = @idPermission)
    BEGIN
        UPDATE RolePermission
        SET active = @active
        WHERE idRole = @idRole AND idPermission = @idPermission;
    END
    ELSE
    BEGIN
        INSERT INTO RolePermission (idRole, idPermission, active)
        VALUES (@idRole, @idPermission, @active);
    END
    
    SELECT @idRole AS idRole, @idPermission AS idPermission, @active AS active;
END;

-- Check if role has permission
CREATE   PROCEDURE sp_RolePermission_Check
    @idRole INT,
    @idPermission INT,
    @activeOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM RolePermission 
                WHERE idRole = @idRole 
                    AND idPermission = @idPermission
                    AND (@activeOnly = 0 OR active = 1)
            ) THEN 1 
            ELSE 0 
        END AS hasPermission,
        idRole,
        idPermission,
        active
    FROM RolePermission
    WHERE idRole = @idRole AND idPermission = @idPermission;
END;

-- Get permissions by role
CREATE   PROCEDURE sp_RolePermission_GetPermissionsByRole
    @idRole INT,
    @activeOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        rp.idRole,
        rp.idPermission,
        rp.active,
        p.name AS permissionName,
        p.active AS permissionActive
    FROM RolePermission rp
    INNER JOIN Permission p ON rp.idPermission = p.id
    WHERE rp.idRole = @idRole
        AND (@activeOnly = 0 OR rp.active = 1)
    ORDER BY p.name;
END;

-- Get roles by permission
CREATE   PROCEDURE sp_RolePermission_GetRolesByPermission
    @idPermission INT,
    @activeOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        rp.idRole,
        rp.idPermission,
        rp.active,
        r.name AS roleName,
        r.description AS roleDescription,
        r.active AS roleActive
    FROM RolePermission rp
    INNER JOIN [Role] r ON rp.idRole = r.id
    WHERE rp.idPermission = @idPermission
        AND (@activeOnly = 0 OR rp.active = 1)
    ORDER BY r.name;
END;

-- Get statistics
CREATE   PROCEDURE sp_RolePermission_GetStats
    @idRole INT = NULL,
    @idPermission INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @idRole IS NOT NULL
    BEGIN
        -- Stats for a specific role
        SELECT 
            @idRole AS idRole,
            COUNT(*) AS totalPermissions,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activePermissions,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactivePermissions
        FROM RolePermission
        WHERE idRole = @idRole;
    END
    ELSE IF @idPermission IS NOT NULL
    BEGIN
        -- Stats for a specific permission
        SELECT 
            @idPermission AS idPermission,
            COUNT(*) AS totalRoles,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activeRoles,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactiveRoles
        FROM RolePermission
        WHERE idPermission = @idPermission;
    END
    ELSE
    BEGIN
        -- Overall stats
        SELECT 
            COUNT(*) AS totalAssignments,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activeAssignments,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactiveAssignments,
            COUNT(DISTINCT idRole) AS totalRoles,
            COUNT(DISTINCT idPermission) AS totalPermissions
        FROM RolePermission;
    END
END;

-- List all role-permission assignments with pagination
CREATE   PROCEDURE sp_RolePermission_List
    @page INT = 1,
    @pageSize INT = 50,
    @activeOnly BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @pageSize;
    DECLARE @totalCount INT;
    
    SELECT @totalCount = COUNT(*)
    FROM RolePermission
    WHERE @activeOnly = 0 OR active = 1;
    
    SELECT 
        rp.idRole,
        rp.idPermission,
        rp.active,
        r.name AS roleName,
        r.description AS roleDescription,
        r.active AS roleActive,
        p.name AS permissionName,
        p.active AS permissionActive,
        @totalCount AS TotalRecords
    FROM RolePermission rp
    INNER JOIN [Role] r ON rp.idRole = r.id
    INNER JOIN Permission p ON rp.idPermission = p.id
    WHERE @activeOnly = 0 OR rp.active = 1
    ORDER BY r.name, p.name
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
END;

-- Remove permission from role
CREATE   PROCEDURE sp_RolePermission_Remove
    @idRole INT,
    @idPermission INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM RolePermission WHERE idRole = @idRole AND idPermission = @idPermission)
        THROW 50000, 'Role-Permission link not found', 1;
    
    DELETE FROM RolePermission
    WHERE idRole = @idRole AND idPermission = @idPermission;
    
    SELECT @idRole AS idRole, @idPermission AS idPermission;
END;

-- Sync permissions for a role (replace all)
CREATE   PROCEDURE sp_RolePermission_SyncPermissionsForRole
    @idRole INT,
    @permissionIds NVARCHAR(MAX), -- Comma-separated IDs: "1,2,3"
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if role exists
        IF NOT EXISTS (SELECT 1 FROM [Role] WHERE id = @idRole)
            THROW 50000, 'Role not found', 1;
        
        -- Delete existing assignments
        DELETE FROM RolePermission WHERE idRole = @idRole;
        
        -- Insert new assignments
        IF @permissionIds IS NOT NULL AND LEN(@permissionIds) > 0
        BEGIN
            INSERT INTO RolePermission (idRole, idPermission, active)
            SELECT 
                @idRole,
                value,
                @active
            FROM STRING_SPLIT(@permissionIds, ',')
            WHERE value IN (SELECT id FROM Permission);
        END
        
        COMMIT TRANSACTION;
        
        -- Return the new assignments
        EXEC sp_RolePermission_GetPermissionsByRole @idRole, 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- Sync roles for a permission (replace all)
CREATE   PROCEDURE sp_RolePermission_SyncRolesForPermission
    @idPermission INT,
    @roleIds NVARCHAR(MAX), -- Comma-separated IDs: "1,2,3"
    @active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Check if permission exists
        IF NOT EXISTS (SELECT 1 FROM Permission WHERE id = @idPermission)
            THROW 50000, 'Permission not found', 1;
        
        -- Delete existing assignments
        DELETE FROM RolePermission WHERE idPermission = @idPermission;
        
        -- Insert new assignments
        IF @roleIds IS NOT NULL AND LEN(@roleIds) > 0
        BEGIN
            INSERT INTO RolePermission (idRole, idPermission, active)
            SELECT 
                value,
                @idPermission,
                @active
            FROM STRING_SPLIT(@roleIds, ',')
            WHERE value IN (SELECT id FROM [Role]);
        END
        
        COMMIT TRANSACTION;
        
        -- Return the new assignments
        EXEC sp_RolePermission_GetRolesByPermission @idPermission, 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- Toggle active status
CREATE   PROCEDURE sp_RolePermission_Toggle
    @idRole INT,
    @idPermission INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM RolePermission WHERE idRole = @idRole AND idPermission = @idPermission)
        THROW 50000, 'Role-Permission link not found', 1;
    
    UPDATE RolePermission
    SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END
    WHERE idRole = @idRole AND idPermission = @idPermission;
    
    SELECT idRole, idPermission, active
    FROM RolePermission
    WHERE idRole = @idRole AND idPermission = @idPermission;
END;

CREATE PROCEDURE sp_SearchFilialeByName
    @name VARCHAR(255)
AS
BEGIN
    SELECT id, name, active
    FROM Filiale
    WHERE name LIKE '%' + @name + '%';
END;

CREATE PROCEDURE sp_SearchGroupementByName
    @name VARCHAR(255)
AS
BEGIN
    SELECT id, name, active
    FROM Groupement
    WHERE name LIKE '%' + @name + '%';
END;

CREATE PROCEDURE sp_SearchRoleByName
    @name VARCHAR(100)
AS
BEGIN
    SELECT id, name, description, active
    FROM [Role]
    WHERE name LIKE '%' + @name + '%';
END;

CREATE PROCEDURE dbo.sp_SearchUserRole
    @idUser INT = NULL,
    @idRole INT = NULL,
    @onlyActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ur.idUser, u.username AS user_name, ur.idRole, r.name AS role_name, ur.active
    FROM autohall.dbo.UserRole ur
    INNER JOIN autohall.dbo.[User] u ON u.id = ur.idUser
    INNER JOIN autohall.dbo.[Role] r ON r.id = ur.idRole
    WHERE (@idUser IS NULL OR ur.idUser = @idUser)
      AND (@idRole IS NULL OR ur.idRole = @idRole)
      AND (@onlyActive IS NULL OR ur.active = @onlyActive)
    ORDER BY ur.idUser, ur.idRole;
END;

CREATE PROCEDURE dbo.sp_SearchUserSite
    @idGroupement INT = NULL,
    @groupement_name VARCHAR(255) = NULL,
    @idSite INT = NULL,
    @site_type VARCHAR(50) = NULL, -- 'Filiale' or 'Succursale' or NULL
    @onlyActive BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        us.id,
        us.idGroupement,
        g.name AS groupement_name,
        us.idSite,
        COALESCE(f.name, s.name) AS site_name,
        CASE 
            WHEN f.id IS NOT NULL THEN 'Filiale'
            WHEN s.id IS NOT NULL THEN 'Succursale'
            ELSE 'Unknown'
        END AS site_type,
        us.active
    FROM autohall.dbo.UserSite us
    LEFT JOIN autohall.dbo.Groupement g ON g.id = us.idGroupement
    LEFT JOIN autohall.dbo.Filiale f ON f.id = us.idSite
    LEFT JOIN autohall.dbo.Succursale s ON s.id = us.idSite
    WHERE (@idGroupement IS NULL OR us.idGroupement = @idGroupement)
      AND (@groupement_name IS NULL OR g.name LIKE '%' + @groupement_name + '%')
      AND (@idSite IS NULL OR us.idSite = @idSite)
      AND (
            @site_type IS NULL OR
            (@site_type = 'Filiale' AND f.id IS NOT NULL) OR
            (@site_type = 'Succursale' AND s.id IS NOT NULL)
          )
      AND (@onlyActive IS NULL OR us.active = @onlyActive)
    ORDER BY us.id;
END;

-- Upsert parameter
CREATE   PROCEDURE dbo.sp_SetParameter
    @key VARCHAR(100),
    @value VARCHAR(1000),
    @description VARCHAR(500) = NULL,
    @type VARCHAR(50) = NULL,
    @scope VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.AppParameter WHERE [key] = @key)
    BEGIN
        UPDATE dbo.AppParameter
        SET value      = @value,
            description= ISNULL(@description, description),
            [type]     = ISNULL(@type, [type]),
            [scope]    = ISNULL(@scope, [scope]),
            updatedAt  = SYSUTCDATETIME()
        WHERE [key] = @key;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.AppParameter ([key], value, description, [type], [scope])
        VALUES (@key, @value, @description, @type, @scope);
    END
END;

-- ACTIVATE
CREATE   PROCEDURE dbo.sp_Succursale_Activate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Succursale WHERE id = @Id)
  BEGIN RAISERROR('Succursale not found.', 16, 1); RETURN; END;

  UPDATE dbo.Succursale SET active = 1 WHERE id = @Id;

  SELECT id, name, active FROM dbo.Succursale WHERE id = @Id;
END;

-- CREATE
CREATE   PROCEDURE dbo.sp_Succursale_Create
  @Name             VARCHAR(255),
  @Active           BIT = 1,
  @NewSuccursaleId  INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.Succursale (name, active)
  VALUES (@Name, @Active);

  SET @NewSuccursaleId = CONVERT(INT, SCOPE_IDENTITY());
END;

-- DEACTIVATE
CREATE   PROCEDURE dbo.sp_Succursale_Deactivate
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Succursale WHERE id = @Id)
  BEGIN RAISERROR('Succursale not found.', 16, 1); RETURN; END;

  UPDATE dbo.Succursale SET active = 0 WHERE id = @Id;

  SELECT id, name, active FROM dbo.Succursale WHERE id = @Id;
END;

-- GET BY ID
CREATE   PROCEDURE dbo.sp_Succursale_GetById
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, name, active FROM dbo.Succursale WHERE id = @Id;
END;

CREATE   PROCEDURE [dbo].[sp_Succursale_List]
  @OnlyActive BIT = 1,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    id, 
    name, 
    active,
    COUNT(*) OVER() AS TotalRecords
  FROM dbo.Succursale
  WHERE (@OnlyActive = 0 OR active = 1)
  ORDER BY name
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

-- SEARCH by name (optionally only active)
CREATE   PROCEDURE dbo.sp_Succursale_Search
  @q          VARCHAR(255),
  @OnlyActive BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  SELECT id, name, active
  FROM dbo.Succursale
  WHERE name LIKE '%' + @q + '%'
    AND (@OnlyActive = 0 OR active = 1)
  ORDER BY name;
END;

-- UPDATE (partial)
CREATE   PROCEDURE dbo.sp_Succursale_Update
  @Id     INT,
  @Name   VARCHAR(255) = NULL,
  @Active BIT          = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.Succursale WHERE id = @Id)
  BEGIN
      RAISERROR('Succursale not found.', 16, 1);
      RETURN;
  END;

  UPDATE s
  SET name   = COALESCE(@Name, s.name),
      active = COALESCE(@Active, s.active)
  FROM dbo.Succursale s
  WHERE s.id = @Id;

  SELECT id, name, active FROM dbo.Succursale WHERE id = @Id;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE id = @id)
    THROW 52007, 'TypeObjectif id not found.', 1;

  UPDATE dbo.TypeObjectif
  SET active = 1
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_Create
  @name   varchar(100),
  @newId  int OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 52001, 'name is required.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE name = @name)
    THROW 52002, 'A TypeObjectif with the same name already exists.', 1;

  INSERT INTO dbo.TypeObjectif (name, active)
  VALUES (@name, 1);

  SET @newId = SCOPE_IDENTITY();

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE id = @newId;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE id = @id)
    THROW 52008, 'TypeObjectif id not found.', 1;

  UPDATE dbo.TypeObjectif
  SET active = 0
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_GetByIdActive
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE id = @id AND active = 1;

  -- Optional strict mode:
  -- IF @@ROWCOUNT = 0 THROW 52006, 'Active TypeObjectif not found.', 1;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_ListActive
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE active = 1
  ORDER BY name;
END;

CREATE PROCEDURE dbo.sp_TypeObjectif_Update
  @id     int,
  @name   varchar(100)
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE id = @id)
    THROW 52003, 'TypeObjectif id not found.', 1;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 52004, 'name is required.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypeObjectif WHERE name = @name AND id <> @id)
    THROW 52005, 'Another TypeObjectif with the same name already exists.', 1;

  UPDATE dbo.TypeObjectif
  SET name = @name
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeObjectif
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id = @id)
    THROW 50009, 'TypePeriode id not found.', 1;

  UPDATE dbo.TypePeriode
  SET active = 1
  WHERE id = @id;

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_Create
  @name          varchar(50),
  @hebdomadaire  bit,
  @mensuel       bit,
  @newId         int OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 50001, 'name is required.', 1;

  -- patched: cast bit -> int before addition
  IF (COALESCE(CAST(@hebdomadaire AS int),0) + COALESCE(CAST(@mensuel AS int),0)) <> 1
    THROW 50002, 'Exactly one of hebdomadaire or mensuel must be 1.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE name = @name)
    THROW 50003, 'A TypePeriode with the same name already exists.', 1;

  INSERT INTO dbo.TypePeriode (name, hebdomadaire, mensuel, active)
  VALUES (@name, @hebdomadaire, @mensuel, 1);

  SET @newId = SCOPE_IDENTITY();

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE id = @newId;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id = @id)
    THROW 50010, 'TypePeriode id not found.', 1;

  UPDATE dbo.TypePeriode
  SET active = 0
  WHERE id = @id;

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_GetByIdActive
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE id = @id AND active = 1;

  -- Uncomment to enforce not found as error:
  -- IF @@ROWCOUNT = 0 THROW 50008, 'Active TypePeriode not found.', 1;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_ListActive
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE active = 1
  ORDER BY name;
END;

CREATE PROCEDURE dbo.sp_TypePeriode_Update
  @id            int,
  @name          varchar(50),
  @hebdomadaire  bit,
  @mensuel       bit
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE id = @id)
    THROW 50004, 'TypePeriode id not found.', 1;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 50005, 'name is required.', 1;

  -- patched: cast bit -> int before addition
  IF (COALESCE(CAST(@hebdomadaire AS int),0) + COALESCE(CAST(@mensuel AS int),0)) <> 1
    THROW 50006, 'Exactly one of hebdomadaire or mensuel must be 1.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypePeriode WHERE name = @name AND id <> @id)
    THROW 50007, 'Another TypePeriode with the same name already exists.', 1;

  UPDATE dbo.TypePeriode
  SET name = @name,
      hebdomadaire = @hebdomadaire,
      mensuel = @mensuel
  WHERE id = @id;

  SELECT id, name, hebdomadaire, mensuel, active
  FROM dbo.TypePeriode
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypeVente_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeVente WHERE id = @id)
    THROW 53007, 'TypeVente id not found.', 1;

  UPDATE dbo.TypeVente
  SET active = 1
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypeVente_Create
  @name   varchar(100),
  @newId  int OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 53001, 'name is required.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypeVente WHERE name = @name)
    THROW 53002, 'A TypeVente with the same name already exists.', 1;

  INSERT INTO dbo.TypeVente (name, active)
  VALUES (@name, 1);

  SET @newId = SCOPE_IDENTITY();

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE id = @newId;
END;

CREATE PROCEDURE dbo.sp_TypeVente_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeVente WHERE id = @id)
    THROW 53008, 'TypeVente id not found.', 1;

  UPDATE dbo.TypeVente
  SET active = 0
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_TypeVente_GetByIdActive
  @id int
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE id = @id AND active = 1;

  -- Optional strict mode:
  -- IF @@ROWCOUNT = 0 THROW 53006, 'Active TypeVente not found.', 1;
END;

CREATE PROCEDURE dbo.sp_TypeVente_ListActive
AS
BEGIN
  SET NOCOUNT ON;

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE active = 1
  ORDER BY name;
END;

CREATE PROCEDURE dbo.sp_TypeVente_Update
  @id     int,
  @name   varchar(100)
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.TypeVente WHERE id = @id)
    THROW 53003, 'TypeVente id not found.', 1;

  IF NULLIF(LTRIM(RTRIM(@name)), '') IS NULL
    THROW 53004, 'name is required.', 1;

  IF EXISTS (SELECT 1 FROM dbo.TypeVente WHERE name = @name AND id <> @id)
    THROW 53005, 'Another TypeVente with the same name already exists.', 1;

  UPDATE dbo.TypeVente
  SET name = @name
  WHERE id = @id;

  SELECT id, name, active
  FROM dbo.TypeVente
  WHERE id = @id;
END;

CREATE PROCEDURE sp_UpdateFiliale
    @id INT,
    @name VARCHAR(255),
    @active BIT
AS
BEGIN
    UPDATE Filiale
    SET name = @name,
        active = @active
    WHERE id = @id;
END;

CREATE PROCEDURE sp_UpdateGroupement
    @id INT,
    @name VARCHAR(255),
    @active BIT
AS
BEGIN
    UPDATE Groupement
    SET name = @name,
        active = @active
    WHERE id = @id;
END;

CREATE PROCEDURE sp_UpdateRole
    @id INT,
    @name VARCHAR(100),
    @description VARCHAR(500) = NULL,
    @active BIT
AS
BEGIN
    BEGIN TRY
        UPDATE [Role]
        SET name = @name,
            description = @description,
            active = @active
        WHERE id = @id;
    END TRY
    BEGIN CATCH
        -- Handle unique name constraint error
        IF ERROR_NUMBER() = 2627 
            RAISERROR('Role name must be unique.', 16, 1);
        ELSE
            THROW;
    END CATCH
END;

CREATE PROCEDURE dbo.sp_UpdateUserSite
    @id INT,
    @idGroupement INT,
    @idSite INT,
    @active BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.UserSite us WHERE us.id = @id)
    BEGIN
        RAISERROR('UserSite id %d does not exist.', 16, 1, @id);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.Groupement g WHERE g.id = @idGroupement)
    BEGIN
        RAISERROR('Groupement id %d does not exist.', 16, 1, @idGroupement);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM autohall.dbo.Filiale f WHERE f.id = @idSite)
       AND NOT EXISTS (SELECT 1 FROM autohall.dbo.Succursale s WHERE s.id = @idSite)
    BEGIN
        RAISERROR('idSite %d does not exist in Filiale or Succursale.', 16, 1, @idSite);
        RETURN;
    END;

    UPDATE autohall.dbo.UserSite
    SET idGroupement = @idGroupement,
        idSite = @idSite,
        active = @active
    WHERE id = @id;
END;

CREATE PROCEDURE dbo.sp_upgraddiagrams
	AS
	BEGIN
		IF OBJECT_ID(N'dbo.sysdiagrams') IS NOT NULL
			return 0;
	
		CREATE TABLE dbo.sysdiagrams
		(
			name sysname NOT NULL,
			principal_id int NOT NULL,	-- we may change it to varbinary(85)
			diagram_id int PRIMARY KEY IDENTITY,
			version int,
	
			definition varbinary(max)
			CONSTRAINT UK_principal_name UNIQUE
			(
				principal_id,
				name
			)
		);


		/* Add this if we need to have some form of extended properties for diagrams */
		/*
		IF OBJECT_ID(N'dbo.sysdiagram_properties') IS NULL
		BEGIN
			CREATE TABLE dbo.sysdiagram_properties
			(
				diagram_id int,
				name sysname,
				value varbinary(max) NOT NULL
			)
		END
		*/

		IF OBJECT_ID(N'dbo.dtproperties') IS NOT NULL
		begin
			insert into dbo.sysdiagrams
			(
				[name],
				[principal_id],
				[version],
				[definition]
			)
			select	 
				convert(sysname, dgnm.[uvalue]),
				DATABASE_PRINCIPAL_ID(N'dbo'),			-- will change to the sid of sa
				0,							-- zero for old format, dgdef.[version],
				dgdef.[lvalue]
			from dbo.[dtproperties] dgnm
				inner join dbo.[dtproperties] dggd on dggd.[property] = 'DtgSchemaGUID' and dggd.[objectid] = dgnm.[objectid]	
				inner join dbo.[dtproperties] dgdef on dgdef.[property] = 'DtgSchemaDATA' and dgdef.[objectid] = dgnm.[objectid]
				
			where dgnm.[property] = 'DtgSchemaNAME' and dggd.[uvalue] like N'_EA3E6268-D998-11CE-9454-00AA00A3F36E_' 
			return 2;
		end
		return 1;
	END;

-- Activate User
CREATE PROCEDURE dbo.sp_User_Activate
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @Id)
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.[User]
    SET 
        active    = 1,
        actif     = 1,
        updatedAt = SYSUTCDATETIME()
    WHERE id = @Id;

    SELECT 
        id, 
        full_name, 
        email, 
        username, 
        active, 
        actif, 
        updatedAt
    FROM dbo.[User]
    WHERE id = @Id;
END;

-- Check permission by name
CREATE   PROCEDURE dbo.sp_User_CheckPermission
  @UserId INT,
  @PermissionName VARCHAR(150)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT dbo.fn_UserHasPermission(@UserId, @PermissionName) AS hasPermission;
END;

-- Deactivate User
CREATE PROCEDURE dbo.sp_User_Deactivate
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @Id)
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.[User]
    SET 
        active    = 0,
        actif     = 0,
        updatedAt = SYSUTCDATETIME()
    WHERE id = @Id;

    SELECT 
        id, 
        full_name, 
        email, 
        username, 
        active, 
        actif, 
        updatedAt
    FROM dbo.[User]
    WHERE id = @Id;
END;

-- Get User by ID (Safe - No Password)
CREATE PROCEDURE dbo.sp_User_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id,
        full_name,
        email,
        username,
        idUserSite,
        actif,
        createdAt,
        updatedAt,
        active
    FROM dbo.[User]
    WHERE id = @Id;
END;

-- Users by groupement
CREATE   PROCEDURE [dbo].[sp_User_ListByGroupement]
    @IdGroupement INT,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    -- Get paginated results with total count
    SELECT 
        u.*,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.[User] u
    JOIN dbo.UserSite us ON us.id = u.idUserSite
    WHERE us.idGroupement = @IdGroupement 
        AND u.active = 1
    ORDER BY u.username ASC
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- User's permissions
CREATE   PROCEDURE [dbo].[sp_User_ListPermissions]
    @UserId INT,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    -- Get paginated results with total count
    SELECT 
        p.id, 
        p.name, 
        up.active,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.UserPermission up
    JOIN dbo.Permission p ON p.id = up.idPermission
    WHERE up.idUser = @UserId
    ORDER BY p.name ASC
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- Update User Information (Partial Update)
CREATE PROCEDURE dbo.sp_User_Update
    @Id            INT,
    @FullName      VARCHAR(255) = NULL,
    @Email         VARCHAR(255) = NULL,
    @Username      VARCHAR(100) = NULL,
    @Password      VARCHAR(255) = NULL,  -- Should be pre-hashed from application
    @IdUserSite    INT          = NULL,
    @Actif         BIT          = NULL,
    @Active        BIT          = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @Id)
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END;

    -- Check for email uniqueness (if changing email)
    IF @Email IS NOT NULL AND @Email <> (SELECT email FROM dbo.[User] WHERE id = @Id)
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.[User] WHERE email = @Email AND id <> @Id)
        BEGIN
            RAISERROR('Email already exists.', 16, 1);
            RETURN;
        END;
    END;

    -- Check for username uniqueness (if changing username)
    IF @Username IS NOT NULL AND @Username <> (SELECT username FROM dbo.[User] WHERE id = @Id)
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.[User] WHERE username = @Username AND id <> @Id)
        BEGIN
            RAISERROR('Username already exists.', 16, 1);
            RETURN;
        END;
    END;

    -- Validate UserSite if provided
    IF @IdUserSite IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.UserSite WHERE id = @IdUserSite AND active = 1)
        BEGIN
            RAISERROR('UserSite not found or inactive.', 16, 1);
            RETURN;
        END;
    END;

    -- Perform partial update using COALESCE
    UPDATE u
    SET 
        full_name   = COALESCE(@FullName, u.full_name),
        email       = COALESCE(@Email, u.email),
        username    = COALESCE(@Username, u.username),
        password    = COALESCE(@Password, u.password),
        idUserSite  = COALESCE(@IdUserSite, u.idUserSite),
        actif       = COALESCE(@Actif, u.actif),
        active      = COALESCE(@Active, u.active),
        updatedAt   = SYSUTCDATETIME()
    FROM dbo.[User] u
    WHERE u.id = @Id;

    -- Return updated user (without password for security)
    SELECT 
        id,
        full_name,
        email,
        username,
        idUserSite,
        actif,
        createdAt,
        updatedAt,
        active
    FROM dbo.[User]
    WHERE id = @Id;
END;

-- Update User Password (Separate for Security)
CREATE PROCEDURE dbo.sp_User_UpdatePassword
    @Id              INT,
    @NewPasswordHash VARCHAR(255)  -- Pre-hashed with bcrypt from application
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @Id)
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.[User]
    SET 
        password  = @NewPasswordHash,
        updatedAt = SYSUTCDATETIME()
    WHERE id = @Id;

    SELECT 
        id,
        full_name,
        email,
        username,
        updatedAt
    FROM dbo.[User]
    WHERE id = @Id;
END;

-- Update User Site Assignment
CREATE PROCEDURE dbo.sp_User_UpdateSite
    @Id         INT,
    @IdUserSite INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @Id)
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END;

    -- Validate UserSite
    IF NOT EXISTS (SELECT 1 FROM dbo.UserSite WHERE id = @IdUserSite AND active = 1)
    BEGIN
        RAISERROR('UserSite not found or inactive.', 16, 1);
        RETURN;
    END;

    UPDATE dbo.[User]
    SET 
        idUserSite = @IdUserSite,
        updatedAt  = SYSUTCDATETIME()
    WHERE id = @Id;

    SELECT 
        id, 
        full_name, 
        email, 
        username, 
        idUserSite, 
        updatedAt
    FROM dbo.[User]
    WHERE id = @Id;
END;

----------------------------------------------------
-- 1) Assign Role to User (Link/Create)
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_Assign
    @UserId INT,
    @RoleId INT,
    @Active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if relationship exists
        IF EXISTS (SELECT 1 FROM dbo.UserRole WHERE idUser = @UserId AND idRole = @RoleId)
        BEGIN
            -- Update existing
            UPDATE dbo.UserRole
            SET active = @Active
            WHERE idUser = @UserId AND idRole = @RoleId;
            
            SELECT 'updated' AS action, @UserId AS userId, @RoleId AS roleId, @Active AS active;
        END
        ELSE
        BEGIN
            -- Insert new
            INSERT INTO dbo.UserRole (idUser, idRole, active)
            VALUES (@UserId, @RoleId, @Active);
            
            SELECT 'created' AS action, @UserId AS userId, @RoleId AS roleId, @Active AS active;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;

----------------------------------------------------
-- 8) Check if User Has Role
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_CheckAccess
    @UserId INT,
    @RoleId INT,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM dbo.UserRole 
                WHERE idUser = @UserId 
                    AND idRole = @RoleId
                    AND (@ActiveOnly = 0 OR active = 1)
            ) THEN 1 
            ELSE 0 
        END AS hasAccess,
        @UserId AS userId,
        @RoleId AS roleId;
END;

----------------------------------------------------
-- 10) Get All User-Role Assignments (Admin View)
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_GetAll
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @ActiveOnly BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Get total count
    SELECT COUNT(*) AS totalRecords
    FROM dbo.UserRole ur
    WHERE @ActiveOnly = 0 OR ur.active = 1;
    
    -- Get paginated results
    SELECT 
        ur.idUser,
        ur.idRole,
        ur.active,
        u.username,
        u.email,
        u.full_name,
        r.name AS roleName,
        r.description AS roleDescription
    FROM dbo.UserRole ur
    INNER JOIN dbo.[User] u ON u.id = ur.idUser
    INNER JOIN dbo.[Role] r ON r.id = ur.idRole
    WHERE @ActiveOnly = 0 OR ur.active = 1
    ORDER BY u.username, r.name
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;

----------------------------------------------------
-- 3) Get All Roles for a User
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_GetRolesByUser
    @UserId INT,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ur.idUser,
        ur.idRole,
        ur.active,
        r.id AS roleId,
        r.name AS roleName,
        r.description AS roleDescription,
        r.active AS roleActive
    FROM dbo.UserRole ur
    INNER JOIN dbo.[Role] r ON r.id = ur.idRole
    WHERE ur.idUser = @UserId
        AND (@ActiveOnly = 0 OR ur.active = 1)
    ORDER BY r.name;
END;

----------------------------------------------------
-- 9) Get User-Role Statistics
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_GetStats
    @UserId INT = NULL,
    @RoleId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @UserId IS NOT NULL
    BEGIN
        -- Stats for specific user
        SELECT 
            @UserId AS userId,
            COUNT(*) AS totalRoles,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activeRoles,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactiveRoles
        FROM dbo.UserRole
        WHERE idUser = @UserId;
    END
    ELSE IF @RoleId IS NOT NULL
    BEGIN
        -- Stats for specific role
        SELECT 
            @RoleId AS roleId,
            COUNT(*) AS totalUsers,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activeUsers,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactiveUsers
        FROM dbo.UserRole
        WHERE idRole = @RoleId;
    END
    ELSE
    BEGIN
        -- Overall stats
        SELECT 
            COUNT(*) AS totalAssignments,
            COUNT(DISTINCT idUser) AS totalUsers,
            COUNT(DISTINCT idRole) AS totalRoles,
            SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS activeAssignments,
            SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactiveAssignments
        FROM dbo.UserRole;
    END
END;

----------------------------------------------------
-- 4) Get All Users for a Role
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_GetUsersByRole
    @RoleId INT,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ur.idUser,
        ur.idRole,
        ur.active,
        u.id AS userId,
        u.username,
        u.email,
        u.full_name,
        u.active AS userActive
    FROM dbo.UserRole ur
    INNER JOIN dbo.[User] u ON u.id = ur.idUser
    WHERE ur.idRole = @RoleId
        AND (@ActiveOnly = 0 OR ur.active = 1)
    ORDER BY u.username;
END;

----------------------------------------------------
-- 2) Remove Role from User (Delete)
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_Remove
    @UserId INT,
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM dbo.UserRole
    WHERE idUser = @UserId AND idRole = @RoleId;
    
    SELECT @@ROWCOUNT AS rowsAffected, @UserId AS userId, @RoleId AS roleId;
END;

----------------------------------------------------
-- 6) Bulk Assign Roles to User (Replace All)
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_SyncRolesForUser
    @UserId INT,
    @RoleIds NVARCHAR(MAX), -- Comma-separated: "1,2,3"
    @Active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parse comma-separated role IDs
        DECLARE @RoleIdTable TABLE (RoleId INT);
        
        INSERT INTO @RoleIdTable (RoleId)
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@RoleIds, ',')
        WHERE RTRIM(value) <> '';
        
        -- Delete roles not in the new list
        DELETE FROM dbo.UserRole
        WHERE idUser = @UserId
            AND idRole NOT IN (SELECT RoleId FROM @RoleIdTable);
        
        -- Insert or update roles in the new list
        MERGE dbo.UserRole AS target
        USING @RoleIdTable AS source
        ON target.idUser = @UserId AND target.idRole = source.RoleId
        WHEN MATCHED THEN
            UPDATE SET active = @Active
        WHEN NOT MATCHED BY TARGET THEN
            INSERT (idUser, idRole, active)
            VALUES (@UserId, source.RoleId, @Active);
        
        COMMIT TRANSACTION;
        
        -- Return the synced roles
        SELECT 
            ur.idUser,
            ur.idRole,
            ur.active,
            r.name AS roleName
        FROM dbo.UserRole ur
        INNER JOIN dbo.[Role] r ON r.id = ur.idRole
        WHERE ur.idUser = @UserId
        ORDER BY r.name;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

----------------------------------------------------
-- 7) Bulk Assign Users to Role (Replace All)
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_SyncUsersForRole
    @RoleId INT,
    @UserIds NVARCHAR(MAX), -- Comma-separated: "1,2,3"
    @Active BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parse comma-separated user IDs
        DECLARE @UserIdTable TABLE (UserId INT);
        
        INSERT INTO @UserIdTable (UserId)
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@UserIds, ',')
        WHERE RTRIM(value) <> '';
        
        -- Delete users not in the new list
        DELETE FROM dbo.UserRole
        WHERE idRole = @RoleId
            AND idUser NOT IN (SELECT UserId FROM @UserIdTable);
        
        -- Insert or update users in the new list
        MERGE dbo.UserRole AS target
        USING @UserIdTable AS source
        ON target.idUser = source.UserId AND target.idRole = @RoleId
        WHEN MATCHED THEN
            UPDATE SET active = @Active
        WHEN NOT MATCHED BY TARGET THEN
            INSERT (idUser, idRole, active)
            VALUES (source.UserId, @RoleId, @Active);
        
        COMMIT TRANSACTION;
        
        -- Return the synced users
        SELECT 
            ur.idUser,
            ur.idRole,
            ur.active,
            u.username,
            u.email
        FROM dbo.UserRole ur
        INNER JOIN dbo.[User] u ON u.id = ur.idUser
        WHERE ur.idRole = @RoleId
        ORDER BY u.username;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

----------------------------------------------------
-- 5) Toggle Active Status
----------------------------------------------------
CREATE   PROCEDURE dbo.sp_UserRole_ToggleActive
    @UserId INT,
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NewActive BIT;
    
    UPDATE dbo.UserRole
    SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END,
        @NewActive = CASE WHEN active = 1 THEN 0 ELSE 1 END
    WHERE idUser = @UserId AND idRole = @RoleId;
    
    SELECT 
        @@ROWCOUNT AS rowsAffected,
        @UserId AS userId,
        @RoleId AS roleId,
        @NewActive AS newActive;
END;

-- sp_Version_Activate
CREATE   PROCEDURE dbo.sp_Version_Activate
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.[Version] WHERE id = @Id)
    BEGIN 
        RAISERROR('Version not found.', 16, 1); 
        RETURN; 
    END;
    
    UPDATE dbo.[Version] SET active = 1 WHERE id = @Id;
    
    SELECT id, name, idModele, active, volume, SalePrice, TMDirect, TMInterGroupe 
    FROM dbo.[Version] WHERE id = @Id;
END;

-- sp_Version_Create
CREATE   PROCEDURE dbo.sp_Version_Create
    @Name VARCHAR(255),
    @IdModele INT,
    @Active BIT = 1,
    @Volume INT = 0,
    @SalePrice DECIMAL(10,2) = 0,
    @TMDirect DECIMAL(5,2) = 0,
    @TMInterGroupe DECIMAL(5,2) = 0,
    @NewVersionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Ensure parent Modele exists and is active
    IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @IdModele AND active = 1)
    BEGIN
        RAISERROR('Modele not found or inactive.', 16, 1);
        RETURN;
    END;
    
    INSERT INTO dbo.[Version] (name, idModele, active, volume, SalePrice, TMDirect, TMInterGroupe)
    VALUES (@Name, @IdModele, @Active, @Volume, @SalePrice, @TMDirect, @TMInterGroupe);
    
    SET @NewVersionId = CONVERT(INT, SCOPE_IDENTITY());
END;

-- sp_Version_Deactivate
CREATE   PROCEDURE dbo.sp_Version_Deactivate
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.[Version] WHERE id = @Id)
    BEGIN 
        RAISERROR('Version not found.', 16, 1); 
        RETURN; 
    END;
    
    UPDATE dbo.[Version] SET active = 0 WHERE id = @Id;
    
    SELECT id, name, idModele, active, volume, SalePrice, TMDirect, TMInterGroupe 
    FROM dbo.[Version] WHERE id = @Id;
END;

-- sp_Version_Delete
CREATE   PROCEDURE dbo.sp_Version_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.[Version] WHERE id = @Id)
    BEGIN 
        RAISERROR('Version not found.', 16, 1); 
        RETURN; 
    END;
    
    DELETE FROM dbo.[Version] WHERE id = @Id;
END;

-- sp_Version_GetById
CREATE   PROCEDURE dbo.sp_Version_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT id, name, idModele, active, volume, SalePrice, TMDirect, TMInterGroupe 
    FROM dbo.[Version] 
    WHERE id = @Id;
END;

-- sp_Version_List
CREATE   PROCEDURE dbo.sp_Version_List
    @IdModele INT = NULL,
    @OnlyActive BIT = 1,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    -- Get paginated results with total count
    SELECT 
        id, 
        name, 
        idModele, 
        active, 
        volume,
        SalePrice, 
        TMDirect, 
        TMInterGroupe,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.[Version]
    WHERE (@IdModele IS NULL OR idModele = @IdModele)
        AND (@OnlyActive = 0 OR active = 1)
    ORDER BY name
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- sp_Version_ListByModele
CREATE   PROCEDURE dbo.sp_Version_ListByModele
    @IdModele INT,
    @OnlyActive BIT = 1,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    -- Get paginated results with total count
    SELECT 
        id, 
        name, 
        idModele, 
        active, 
        volume,
        SalePrice, 
        TMDirect, 
        TMInterGroupe,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.[Version]
    WHERE idModele = @IdModele
        AND (@OnlyActive = 0 OR active = 1)
    ORDER BY name
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- sp_Version_Search
CREATE   PROCEDURE dbo.sp_Version_Search
    @q VARCHAR(255),
    @IdModele INT = NULL,
    @OnlyActive BIT = 1,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;
    
    SELECT 
        id, 
        name, 
        idModele, 
        active, 
        volume,
        SalePrice, 
        TMDirect, 
        TMInterGroupe,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.[Version]
    WHERE name LIKE '%' + @q + '%'
      AND (@IdModele IS NULL OR idModele = @IdModele)
      AND (@OnlyActive = 0 OR active = 1)
    ORDER BY name
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- sp_Version_Update
CREATE   PROCEDURE dbo.sp_Version_Update
    @Id INT,
    @Name VARCHAR(255) = NULL,
    @IdModele INT = NULL,
    @Active BIT = NULL,
    @Volume INT = NULL,
    @SalePrice DECIMAL(10,2) = NULL,
    @TMDirect DECIMAL(5,2) = NULL,
    @TMInterGroupe DECIMAL(5,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.[Version] WHERE id = @Id)
    BEGIN
        RAISERROR('Version not found.', 16, 1);
        RETURN;
    END;
    
    -- If changing modele, ensure it exists and is active
    IF @IdModele IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.Modele WHERE id = @IdModele AND active = 1)
        BEGIN
            RAISERROR('Target modele not found or inactive.', 16, 1);
            RETURN;
        END;
    END;
    
    UPDATE v
    SET name = COALESCE(@Name, v.name),
        idModele = COALESCE(@IdModele, v.idModele),
        active = COALESCE(@Active, v.active),
        volume = COALESCE(@Volume, v.volume),
        SalePrice = COALESCE(@SalePrice, v.SalePrice),
        TMDirect = COALESCE(@TMDirect, v.TMDirect),
        TMInterGroupe = COALESCE(@TMInterGroupe, v.TMInterGroupe)
    FROM dbo.[Version] v
    WHERE v.id = @Id;
    
    SELECT id, name, idModele, active, volume, SalePrice, TMDirect, TMInterGroupe 
    FROM dbo.[Version] WHERE id = @Id;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_CountByDay
  @fromUtc datetime2(0),
  @toUtc   datetime2(0),
  @module  varchar(100) = NULL,
  @action  varchar(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    CAST([timestamp] AS date) AS [day],
    COUNT(*) AS cnt
  FROM dbo.AuditLog
  WHERE [timestamp] >= @fromUtc
    AND [timestamp] <= @toUtc
    AND (@module IS NULL OR module = @module)
    AND (@action IS NULL OR [action] = @action)
  GROUP BY CAST([timestamp] AS date)
  ORDER BY [day] DESC;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_CountByHour
  @fromUtc datetime2(0),
  @toUtc   datetime2(0),
  @module  varchar(100) = NULL,
  @action  varchar(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    DATEFROMPARTS(YEAR([timestamp]), MONTH([timestamp]), DAY([timestamp])) AS d,
    DATEPART(HOUR, [timestamp]) AS h,
    COUNT(*) AS cnt
  FROM dbo.AuditLog
  WHERE [timestamp] >= @fromUtc
    AND [timestamp] <= @toUtc
    AND (@module IS NULL OR module = @module)
    AND (@action IS NULL OR [action] = @action)
  GROUP BY DATEFROMPARTS(YEAR([timestamp]), MONTH([timestamp]), DAY([timestamp])),
           DATEPART(HOUR, [timestamp])
  ORDER BY d DESC, h DESC;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_ExportWindow
  @fromUtc   datetime2(0),
  @toUtc     datetime2(0),
  @lastId    int = 0,          -- resume token
  @batchSize int = 50000       -- tune for export tools
AS
BEGIN
  SET NOCOUNT ON;
  IF @batchSize IS NULL OR @batchSize < 1 SET @batchSize = 50000;

  SELECT TOP (@batchSize) *
  FROM dbo.AuditLog
  WHERE [timestamp] >= @fromUtc
    AND [timestamp] <= @toUtc
    AND id > @lastId
  ORDER BY id ASC;             -- monotonic for resume
END;

CREATE   PROCEDURE dbo.usp_AuditLog_GetById
  @id int
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.AuditLog WHERE id = @id;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_LatestPerModule
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH X AS (
    SELECT module,
           MAX([timestamp]) AS lastTs
    FROM dbo.AuditLog
    GROUP BY module
  )
  SELECT A.*
  FROM X
  JOIN dbo.AuditLog AS A
    ON A.module = X.module AND A.[timestamp] = X.lastTs
  ORDER BY A.module;
END;

CREATE   PROCEDURE [dbo].[usp_AuditLog_ListActions]
  @module varchar(100) = NULL,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    [action],
    COUNT(*) OVER() AS TotalRecords
  FROM (
    SELECT DISTINCT [action]
    FROM dbo.AuditLog
    WHERE (@module IS NULL OR module = @module)
  ) AS DistinctActions
  ORDER BY [action]
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[usp_AuditLog_ListModules]
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    module,
    COUNT(*) OVER() AS TotalRecords
  FROM (
    SELECT DISTINCT module
    FROM dbo.AuditLog
  ) AS DistinctModules
  ORDER BY module
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[usp_AuditLog_ListUsers]
  @module varchar(100) = NULL,
  @action varchar(50) = NULL,
  @pageNumber INT = 1,
  @pageSize INT = 10
AS
BEGIN
  SET NOCOUNT ON;
  
  -- Validate pagination parameters
  IF @pageNumber < 1 SET @pageNumber = 1;
  IF @pageSize < 1 SET @pageSize = 10;
  
  -- Get paginated results with total count
  SELECT 
    userId,
    COUNT(*) OVER() AS TotalRecords
  FROM (
    SELECT DISTINCT userId
    FROM dbo.AuditLog
    WHERE (@module IS NULL OR module = @module)
      AND (@action IS NULL OR [action] = @action)
  ) AS DistinctUsers
  ORDER BY userId
  OFFSET (@pageNumber - 1) * @pageSize ROWS
  FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_PurgeRolling
  @retainDays int = 90,
  @module     varchar(100) = NULL,
  @action     varchar(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @cutoff datetime2(0) = DATEADD(day, -@retainDays, SYSUTCDATETIME());

  DELETE L
  FROM dbo.AuditLog AS L
  WHERE L.[timestamp] < @cutoff
    AND (@module IS NULL OR L.module = @module)
    AND (@action IS NULL OR L.[action] = @action);

  SELECT @@ROWCOUNT AS rowsDeleted, @cutoff AS cutoffUtc;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_TopActions
  @fromUtc datetime2(0),
  @toUtc   datetime2(0),
  @topN    int = 10,
  @module  varchar(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF @topN IS NULL OR @topN < 1 SET @topN = 10;

  SELECT TOP (@topN)
    [action],
    COUNT(*) AS cnt
  FROM dbo.AuditLog
  WHERE [timestamp] >= @fromUtc
    AND [timestamp] <= @toUtc
    AND (@module IS NULL OR module = @module)
  GROUP BY [action]
  ORDER BY cnt DESC, [action] ASC;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_TopUsers
  @fromUtc datetime2(0),
  @toUtc   datetime2(0),
  @topN    int = 10,
  @module  varchar(100) = NULL,
  @action  varchar(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF @topN IS NULL OR @topN < 1 SET @topN = 10;

  SELECT TOP (@topN)
    userId,
    COUNT(*) AS cnt
  FROM dbo.AuditLog
  WHERE [timestamp] >= @fromUtc
    AND [timestamp] <= @toUtc
    AND (@module IS NULL OR module = @module)
    AND (@action IS NULL OR [action] = @action)
  GROUP BY userId
  ORDER BY cnt DESC, userId ASC;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_Write
  @module      varchar(100),
  @action      varchar(50),
  @objectId    int = NULL,
  @scope       varchar(100) = NULL,
  @userId      varchar(255) = NULL,       -- optional: may be NULL/empty
  @message     varchar(1000) = NULL,
  @machineIp   varchar(64) = NULL,
  @description varchar(1000) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- normalize user id: prefer explicit param, then SESSION_CONTEXT, else 'anonymous'
  DECLARE @ctxUser sql_variant = SESSION_CONTEXT(N'UserId');
  DECLARE @ctxUserText varchar(255) = TRY_CONVERT(varchar(255), @ctxUser);

  DECLARE @effectiveUserId varchar(255) =
    COALESCE(NULLIF(@userId, ''), NULLIF(@ctxUserText, ''), 'anonymous');

  INSERT INTO dbo.AuditLog
    ([timestamp], module, objectId, [scope], userId, [message], [action], machineIp, description)
  VALUES
    (SYSUTCDATETIME(), @module, @objectId, @scope, @effectiveUserId, @message, @action, @machineIp, @description);

  SELECT SCOPE_IDENTITY() AS id;
END;

CREATE   PROCEDURE dbo.usp_AuditLog_WriteFromSession
  @module      varchar(100),
  @action      varchar(50),
  @objectId    int = NULL,
  @scope       varchar(100) = NULL,
  @message     varchar(1000) = NULL,
  @machineIp   varchar(64) = NULL,
  @description varchar(1000) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @userVar sql_variant = SESSION_CONTEXT(N'UserId');
  DECLARE @userId  varchar(255) = TRY_CONVERT(varchar(255), @userVar);
  IF (@userId IS NULL OR @userId = '') SET @userId = 'anonymous';

  INSERT INTO dbo.AuditLog
    ([timestamp], module, objectId, [scope], userId, [message], [action], machineIp, description)
  VALUES
    (SYSUTCDATETIME(), @module, @objectId, @scope, @userId, @message, @action, @machineIp, @description);

  SELECT SCOPE_IDENTITY() AS id;
END;

CREATE   PROCEDURE [dbo].[usp_GetUserPermissions]
    @UserId INT,
    @IncludeInactive BIT = 0,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;

    -- Get paginated results with total count
    SELECT
        u.id           AS UserId,
        u.username     AS Username,
        p.id           AS PermissionId,
        p.name         AS PermissionName,
        p.active       AS PermissionActive,
        up.active      AS UserPermissionActive,
        COUNT(*) OVER() AS TotalRecords
    FROM autohall.dbo.[User] AS u
    INNER JOIN autohall.dbo.UserPermission AS up
        ON up.idUser = u.id
    INNER JOIN autohall.dbo.Permission AS p
        ON p.id = up.idPermission
    WHERE u.id = @UserId
      AND (
            @IncludeInactive = 1
            OR (p.active = 1 AND up.active = 1 AND u.active = 1)
          )
    ORDER BY PermissionName
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[usp_GetUserRoles]
    @UserId INT,
    @IncludeInactive BIT = 0,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;

    -- Get paginated results with total count
    SELECT
        u.id       AS UserId,
        u.username AS Username,
        r.id       AS RoleId,
        r.name     AS RoleName,
        r.active   AS RoleActive,
        ur.active  AS UserRoleActive,
        COUNT(*) OVER() AS TotalRecords
    FROM autohall.dbo.[User] AS u
    INNER JOIN autohall.dbo.UserRole AS ur
        ON ur.idUser = u.id
    INNER JOIN autohall.dbo.[Role] AS r
        ON r.id = ur.idRole
    WHERE u.id = @UserId
      AND (
            @IncludeInactive = 1
            OR (r.active = 1 AND ur.active = 1 AND u.active = 1)
          )
    ORDER BY RoleName
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

-- Get users by permission id
-- Returns users linked to the given permission.
-- @ActiveOnly = 1 (default): only rows where UserPermission.active = 1 AND Permission.active = 1
-- @ActiveOnly = 0: return all linked users regardless of active flags
CREATE   PROCEDURE dbo.usp_GetUsersByPermission
    @PermissionId INT,
    @ActiveOnly   BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.*,
        up.active      AS UserPermissionActive,
        p.active       AS PermissionActive,
        p.id           AS PermissionId,
        p.name         AS PermissionName
    FROM autohall.dbo.[User] AS u
    INNER JOIN autohall.dbo.UserPermission AS up
        ON up.idUser = u.id
    INNER JOIN autohall.dbo.Permission AS p
        ON p.id = up.idPermission
    WHERE
        up.idPermission = @PermissionId
        AND (
             @ActiveOnly = 0
             OR (up.active = 1 AND p.active = 1)
        )
    ORDER BY u.id;
END;

CREATE   PROCEDURE dbo.usp_Permission_Activate
  @id int
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;
    IF NOT EXISTS (SELECT 1 FROM dbo.Permission WITH (UPDLOCK, HOLDLOCK) WHERE id = @id)
      THROW 50021, 'Permission not found.', 1;

    UPDATE dbo.Permission SET active = 1 WHERE id = @id;

    COMMIT;
    SELECT * FROM dbo.Permission WHERE id = @id;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_Permission_Create
  @name   varchar(150),
  @active bit = 1
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF EXISTS (SELECT 1 FROM dbo.Permission WITH (UPDLOCK, HOLDLOCK) WHERE name = @name)
      THROW 50020, 'Permission name already exists.', 1;  -- unique guard

    INSERT INTO dbo.Permission(name, active) VALUES(@name, @active);
    DECLARE @id int = SCOPE_IDENTITY();

    COMMIT;
    SELECT * FROM dbo.Permission WHERE id = @id;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    -- Bubble up details or map to API layer as needed
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_Permission_Deactivate
  @id int
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;
    IF NOT EXISTS (SELECT 1 FROM dbo.Permission WITH (UPDLOCK, HOLDLOCK) WHERE id = @id)
      THROW 50021, 'Permission not found.', 1;

    UPDATE dbo.Permission SET active = 0 WHERE id = @id;

    COMMIT;
    SELECT * FROM dbo.Permission WHERE id = @id;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_Permission_GetById
  @id int
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.Permission WHERE id = @id;
END;

CREATE   PROCEDURE dbo.usp_Permission_GetByName
  @name varchar(150)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.Permission WHERE name = @name;
END;

CREATE   PROCEDURE dbo.usp_Permission_List
  @active  bit = NULL,
  @search  varchar(150) = NULL,  -- partial name
  @page    int = 1,
  @pageSize int = 50
AS
BEGIN
  SET NOCOUNT ON;

  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 50;

  -- Declare variables for filtered results
  DECLARE @offset int = (@page - 1) * @pageSize;

  -- Main query with pagination
  SELECT *
  FROM dbo.Permission
  WHERE (@active IS NULL OR active = @active)
    AND (@search IS NULL OR name LIKE CONCAT('%', @search, '%'))
  ORDER BY name ASC
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;

  -- Total count query (separate query for total)
  SELECT COUNT(*) AS totalCount 
  FROM dbo.Permission
  WHERE (@active IS NULL OR active = @active)
    AND (@search IS NULL OR name LIKE CONCAT('%', @search, '%'));
END;

CREATE   PROCEDURE dbo.usp_Permission_SetActive
  @id int,
  @active bit
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.Permission SET active = @active WHERE id = @id;
  SELECT * FROM dbo.Permission WHERE id = @id;
END;

CREATE   PROCEDURE dbo.usp_Permission_Update
  @id     int,
  @name   varchar(150) = NULL,
  @active bit = NULL
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (SELECT 1 FROM dbo.Permission WITH (UPDLOCK, HOLDLOCK) WHERE id = @id)
      THROW 50021, 'Permission not found.', 1;

    IF @name IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.Permission WITH (UPDLOCK, HOLDLOCK) WHERE name = @name AND id <> @id)
      THROW 50022, 'Permission name already exists.', 1;

    UPDATE dbo.Permission
      SET name   = COALESCE(@name, name),
          active = COALESCE(@active, active)
    WHERE id = @id;

    COMMIT;
    SELECT * FROM dbo.Permission WHERE id = @id;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_Activate
  @idUser int,
  @idPermission int
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (SELECT 1 FROM dbo.UserPermission WITH (UPDLOCK, HOLDLOCK)
                   WHERE idUser = @idUser AND idPermission = @idPermission)
      THROW 50033, 'UserPermission link not found.', 1;

    UPDATE dbo.UserPermission
      SET active = 1
    WHERE idUser = @idUser AND idPermission = @idPermission;

    COMMIT;
    SELECT * FROM dbo.UserPermission WHERE idUser = @idUser AND idPermission = @idPermission;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_Add
  @idUser int,
  @idPermission int
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    -- Validate existence and active status optionally (adjust as needed)
    IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE id = @idUser)
      THROW 50030, 'User not found.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.Permission WHERE id = @idPermission)
      THROW 50031, 'Permission not found.', 1;

    IF EXISTS (SELECT 1 FROM dbo.UserPermission WITH (UPDLOCK, HOLDLOCK)
               WHERE idUser = @idUser AND idPermission = @idPermission)
    BEGIN
      UPDATE dbo.UserPermission
        SET active = 1
      WHERE idUser = @idUser AND idPermission = @idPermission;
    END
    ELSE
    BEGIN
      INSERT INTO dbo.UserPermission(idUser, idPermission, active)
      VALUES(@idUser, @idPermission, 1);
    END

    COMMIT;
    SELECT * FROM dbo.UserPermission WHERE idUser = @idUser AND idPermission = @idPermission;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_BulkAdd
  @idPermission int,
  @users dbo.IdList READONLY
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (SELECT 1 FROM dbo.Permission WHERE id = @idPermission)
      THROW 50032, 'Permission not found.', 1;

    MERGE dbo.UserPermission AS T
    USING (SELECT id AS idUser FROM @users) AS S
      ON T.idUser = S.idUser AND T.idPermission = @idPermission
    WHEN MATCHED THEN
      UPDATE SET active = 1
    WHEN NOT MATCHED THEN
      INSERT (idUser, idPermission, active) VALUES (S.idUser, @idPermission, 1);

    COMMIT;

    SELECT up.*
    FROM dbo.UserPermission up
    JOIN @users u ON u.id = up.idUser
    WHERE up.idPermission = @idPermission;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_Deactivate
  @idUser int,
  @idPermission int
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF NOT EXISTS (SELECT 1 FROM dbo.UserPermission WITH (UPDLOCK, HOLDLOCK)
                   WHERE idUser = @idUser AND idPermission = @idPermission)
      THROW 50033, 'UserPermission link not found.', 1;

    UPDATE dbo.UserPermission
      SET active = 0
    WHERE idUser = @idUser AND idPermission = @idPermission;

    COMMIT;
    SELECT * FROM dbo.UserPermission WHERE idUser = @idUser AND idPermission = @idPermission;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_HasByName
  @idUser int,
  @permissionName varchar(150)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM dbo.UserPermission up
    JOIN dbo.Permission p ON p.id = up.idPermission
    WHERE up.idUser = @idUser
      AND up.active = 1
      AND p.name = @permissionName
      AND p.active = 1
  ) THEN 1 ELSE 0 END AS hasPermission;
END;

CREATE   PROCEDURE [dbo].[usp_UserPermission_ListByPermission]
    @idPermission INT,
    @active BIT = NULL,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;

    -- Get paginated results with total count
    SELECT 
        up.*, 
        u.username, 
        u.email, 
        u.active AS userActive,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.UserPermission AS up
    JOIN dbo.[User] AS u ON u.id = up.idUser
    WHERE up.idPermission = @idPermission
        AND (@active IS NULL OR up.active = @active)
    ORDER BY u.username ASC
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE [dbo].[usp_UserPermission_ListByUser]
    @idUser INT,
    @active BIT = NULL,
    @pageNumber INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate pagination parameters
    IF @pageNumber < 1 SET @pageNumber = 1;
    IF @pageSize < 1 SET @pageSize = 10;

    -- Get paginated results with total count
    SELECT 
        up.*, 
        p.name AS permissionName, 
        p.active AS permissionActive,
        COUNT(*) OVER() AS TotalRecords
    FROM dbo.UserPermission AS up
    JOIN dbo.Permission AS p ON p.id = up.idPermission
    WHERE up.idUser = @idUser
        AND (@active IS NULL OR up.active = @active)
    ORDER BY p.name ASC
    OFFSET (@pageNumber - 1) * @pageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;

CREATE   PROCEDURE dbo.usp_UserPermission_Remove
  @idUser int,
  @idPermission int,
  @hardDelete bit = 0
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRAN;

    IF @hardDelete = 1
      DELETE FROM dbo.UserPermission WHERE idUser = @idUser AND idPermission = @idPermission;
    ELSE
      UPDATE dbo.UserPermission SET active = 0 WHERE idUser = @idUser AND idPermission = @idPermission;

    COMMIT;
    SELECT @idUser AS idUser, @idPermission AS idPermission, @hardDelete AS hardDelete;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;

CREATE   PROCEDURE dbo.usp_UserPermission_SetActive
  @idUser int,
  @idPermission int,
  @active bit
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.UserPermission
    SET active = @active
  WHERE idUser = @idUser AND idPermission = @idPermission;

  SELECT * FROM dbo.UserPermission WHERE idUser = @idUser AND idPermission = @idPermission;
END;
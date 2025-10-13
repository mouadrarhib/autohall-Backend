// src/sql/snippets.js

export const SQL = {
  USER: {
    // Basic user operations
    CREATE_USER: `EXEC sp_CreateUser @username = :username, @email = :email, @password = :password`,
    FIND_USER_BY_EMAIL: `EXEC sp_FindUserByEmail @Email = :email`,
    GET_USER_BY_ID: `EXEC sp_GetUserById @UserId = :id`,

    // Composite creation with roles/permissions/site
    CREATE_USER_WITH_ROLES_PERMISSIONS_SITE: `EXEC sp_CreateUserWithRolePermissionsAndSite
      @full_name = :full_name,
      @email = :email,
      @username = :username,
      @password = :password,
      @groupement_name = :groupement_name,
      @site_id = :site_id,
      @role_ids = :role_ids,
      @permission_ids = :permission_ids`,

    // Complete info views
    GET_ALL_USERS_COMPLETE_INFO: `SELECT * FROM vw_UserCompleteInfo ORDER BY UserId DESC`,
    GET_USER_COMPLETE_INFO_BY_ID: `SELECT * FROM vw_UserCompleteInfo WHERE UserId = :userId`,
    GET_USERS_BY_SITE_TYPE: `SELECT * FROM vw_UserCompleteInfo WHERE GroupementType = :groupementType ORDER BY UserId DESC`,
    GET_ACTIVE_USERS_COMPLETE_INFO: `SELECT * FROM vw_UserCompleteInfo WHERE UserStatus = 'Active' ORDER BY UserId DESC`,
  },

  // Helpful lookups used in user flows (active only)
  LOOKUP: {
    GET_ALL_FILIALES: `SELECT id, name, active FROM Filiale WHERE active = 1 ORDER BY name`,
    GET_ALL_SUCCURSALES: `SELECT id, name, active FROM Succursale WHERE active = 1 ORDER BY name`,
    GET_ALL_GROUPEMENTS: `SELECT id, name, active FROM Groupement WHERE active = 1 ORDER BY name`,
  },

  PERMISSION: {
    PERM_CREATE: 'EXEC dbo.usp_Permission_Create @name=:name, @active=:active',
    PERM_GET_BY_ID: 'EXEC dbo.usp_Permission_GetById @id=:id',
    PERM_GET_BY_NAME: 'EXEC dbo.usp_Permission_GetByName @name=:name',
    PERM_LIST: 'EXEC dbo.usp_Permission_List @active=:active, @search=:search, @page=:page, @pageSize=:pageSize',
    PERM_UPDATE: 'EXEC dbo.usp_Permission_Update @id=:id, @name=:name, @active=:active',
    PERM_SET_ACTIVE: 'EXEC dbo.usp_Permission_SetActive @id=:id, @active=:active',
    PERM_ACTIVATE: 'EXEC dbo.usp_Permission_Activate @id=:id',
    PERM_DEACTIVATE: 'EXEC dbo.usp_Permission_Deactivate @id=:id',
  },

  USER_PERMISSION: {
    UP_ADD: `EXEC dbo.usp_UserPermission_Add @idUser=:idUser, @idPermission=:idPermission`,
    UP_ACTIVATE: `EXEC dbo.usp_UserPermission_Activate @idUser=:idUser, @idPermission=:idPermission`,
    UP_DEACTIVATE: `EXEC dbo.usp_UserPermission_Deactivate @idUser=:idUser, @idPermission=:idPermission`,
    UP_REMOVE: `EXEC dbo.usp_UserPermission_Remove @idUser=:idUser, @idPermission=:idPermission, @hardDelete=:hardDelete`,
    UP_SET_ACTIVE: `EXEC dbo.usp_UserPermission_SetActive @idUser=:idUser, @idPermission=:idPermission, @active=:active`,
    
    // Updated with pagination parameters
    UP_LIST_BY_USER: `EXEC dbo.usp_UserPermission_ListByUser @idUser=:idUser, @active=:active, @pageNumber=:pageNumber, @pageSize=:pageSize`,
    UP_LIST_BY_PERM: `EXEC dbo.usp_UserPermission_ListByPermission @idPermission=:idPermission, @active=:active, @pageNumber=:pageNumber, @pageSize=:pageSize`,
    
    UP_HAS_BY_NAME: `EXEC dbo.usp_UserPermission_HasByName @idUser=:idUser, @permissionName=:permissionName`,
  },

  ROLE: {
    ROLE_CREATE: 'EXEC dbo.sp_InsertRole @name=:name, @description=:description, @active=:active',
    ROLE_GET_BY_ID: 'EXEC dbo.sp_GetRoleById @id=:id',
    ROLE_GET_ALL: 'EXEC dbo.sp_GetAllRoles',
    ROLE_UPDATE: 'EXEC dbo.sp_UpdateRole @id=:id, @name=:name, @description=:description, @active=:active',
    ROLE_ACTIVATE: 'EXEC dbo.sp_ActivateRole @id=:id',
    ROLE_DEACTIVATE: 'EXEC dbo.sp_DeactivateRole @id=:id',
    ROLE_SEARCH: 'EXEC dbo.sp_SearchRoleByName @name=:name',
  },

  MODELE: {
  MODELE_CREATE: `
    DECLARE @NewId INT;
    EXEC dbo.sp_Modele_Create
      @Name=:name,
      @IdMarque=:idMarque,
      @Active=:active,
      @NewModeleId=@NewId OUTPUT;
    SELECT id=@NewId;
  `,
  MODELE_GET_BY_ID: 'EXEC dbo.sp_Modele_GetById @Id=:id',
  
  // Updated with pagination
  MODELE_LIST: 'EXEC dbo.sp_Modele_List @IdMarque=:idMarque, @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
  
  // Updated with pagination
  MODELE_LIST_BY_MARQUE: 'EXEC dbo.sp_Modele_ListByMarque @IdMarque=:idMarque, @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
  
  // Updated with pagination
  MODELE_SEARCH: 'EXEC dbo.sp_Modele_Search @q=:q, @IdMarque=:idMarque, @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
  
  MODELE_UPDATE: 'EXEC dbo.sp_Modele_Update @Id=:id, @Name=:name, @IdMarque=:idMarque, @Active=:active',
  MODELE_ACTIVATE: 'EXEC dbo.sp_Modele_Activate @Id=:id',
  MODELE_DEACTIVATE: 'EXEC dbo.sp_Modele_Deactivate @Id=:id',
  MODELE_DELETE: 'EXEC dbo.sp_Modele_Delete @Id=:id',
  },



  FILIALE: {
    FILIALE_CREATE: 'EXEC dbo.sp_InsertFiliale @name=:name, @active=:active',
    FILIALE_GET_BY_ID: 'EXEC dbo.sp_GetFilialeById @id=:id',
    
    // Updated with pagination
    FILIALE_GET_ALL: 'EXEC dbo.sp_GetAllFiliales @pageNumber=:pageNumber, @pageSize=:pageSize',
    
    FILIALE_DEACTIVATE: 'EXEC dbo.sp_DeactivateFiliale @id=:id',
    FILIALE_ACTIVATE: 'EXEC dbo.sp_ActivateFiliale @id=:id',
    FILIALE_UPDATE: 'EXEC dbo.sp_UpdateFiliale @id=:id, @name=:name, @active=:active',
  },


  MODELE: {
    MODELE_CREATE: `
      DECLARE @NewId INT;
      EXEC dbo.sp_Modele_Create
        @Name=:name,
        @IdMarque=:idMarque,
        @Active=:active,
        @NewModeleId=@NewId OUTPUT;
      SELECT id=@NewId;
    `,
    MODELE_GET_BY_ID: 'EXEC dbo.sp_Modele_GetById @Id=:id',
    MODELE_LIST: 'EXEC dbo.sp_Modele_List @IdMarque=:idMarque, @OnlyActive=:onlyActive',
    MODELE_LIST_BY_MARQUE: 'EXEC dbo.sp_Modele_ListByMarque @IdMarque=:idMarque, @OnlyActive=:onlyActive',
    MODELE_SEARCH: 'EXEC dbo.sp_Modele_Search @q=:q, @IdMarque=:idMarque, @OnlyActive=:onlyActive',
    MODELE_UPDATE: 'EXEC dbo.sp_Modele_Update @Id=:id, @Name=:name, @IdMarque=:idMarque, @Active=:active',
    MODELE_ACTIVATE: 'EXEC dbo.sp_Modele_Activate @Id=:id',
    MODELE_DEACTIVATE: 'EXEC dbo.sp_Modele_Deactivate @Id=:id',
    MODELE_DELETE: 'EXEC dbo.sp_Modele_Delete @Id=:id',
  },

  VERSION: {
    VERSION_CREATE: `
      EXEC dbo.sp_Version_Create
      @name = :name,
      @idModele = :idModele,
      @volume = :volume,
      @price = :price,
      @tm = :tm,
      @margin = :margin,
      @newId = NULL OUTPUT
    `,
    VERSION_UPDATE: `
      EXEC dbo.sp_Version_Update
      @id = :id,
      @name = :name,
      @idModele = :idModele,
      @volume = :volume,
      @price = :price,
      @tm = :tm,
      @margin = :margin
    `,
    VERSION_GET_BY_ID: `
      EXEC dbo.sp_Version_GetById @id = :id
    `,
    // Updated with pagination
    VERSION_LIST: `
      EXEC dbo.sp_Version_List 
      @IdModele = :idModele, 
      @OnlyActive = :onlyActive,
      @pageNumber = :pageNumber,
      @pageSize = :pageSize
    `,
    // Updated with pagination
    VERSION_LIST_BY_MODELE: `
      EXEC dbo.sp_Version_ListByModele 
      @IdModele = :idModele, 
      @OnlyActive = :onlyActive,
      @pageNumber = :pageNumber,
      @pageSize = :pageSize
    `,
    VERSION_SEARCH: `
      EXEC dbo.sp_Version_Search @q = :q, @idModele = :idModele, @onlyActive = :onlyActive
    `,
    VERSION_ACTIVATE: `
      EXEC dbo.sp_Version_Activate @id = :id
    `,
    VERSION_DEACTIVATE: `
      EXEC dbo.sp_Version_Deactivate @id = :id
    `
  },

  SUCCURSALE: {
  SUCCURSALE_CREATE: `
    DECLARE @NewId INT;
    EXEC dbo.sp_Succursale_Create
      @Name=:name,
      @Active=:active,
      @NewSuccursaleId=@NewId OUTPUT;
    SELECT id=@NewId;
  `,
  SUCCURSALE_GET_BY_ID: 'EXEC dbo.sp_Succursale_GetById @Id=:id',
  
  // Updated with pagination
  SUCCURSALE_LIST: 'EXEC dbo.sp_Succursale_List @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
  
  SUCCURSALE_SEARCH: 'EXEC dbo.sp_Succursale_Search @q=:q, @OnlyActive=:onlyActive',
  SUCCURSALE_UPDATE: 'EXEC dbo.sp_Succursale_Update @Id=:id, @Name=:name, @Active=:active',
  SUCCURSALE_ACTIVATE: 'EXEC dbo.sp_Succursale_Activate @Id=:id',
  SUCCURSALE_DEACTIVATE: 'EXEC dbo.sp_Succursale_Deactivate @Id=:id',
  },


  GROUPEMENT: {
    GROUPEMENT_CREATE: 'EXEC dbo.sp_InsertGroupement @name=:name, @active=:active',
    GROUPEMENT_GET_BY_ID: 'EXEC dbo.sp_GetGroupementById @id=:id',
    GROUPEMENT_GET_ALL: 'EXEC dbo.sp_GetAllGroupements',
    GROUPEMENT_UPDATE: 'EXEC dbo.sp_UpdateGroupement @id=:id, @name=:name, @active=:active',
    GROUPEMENT_DELETE: 'EXEC dbo.sp_DeleteGroupement @id=:id',
    GROUPEMENT_ACTIVATE: 'EXEC dbo.sp_ActivateGroupement @id=:id',
    GROUPEMENT_DEACTIVATE: 'EXEC dbo.sp_DeactivateGroupement @id=:id',
    GROUPEMENT_SEARCH: 'EXEC dbo.sp_SearchGroupementByName @name=:name',
    
    // NEW: Add pagination support for users by groupement
    USER_LIST_BY_GROUPEMENT: `EXEC dbo.sp_User_ListByGroupement 
      @IdGroupement=:idGroupement, 
      @pageNumber=:pageNumber, 
      @pageSize=:pageSize`,
  },

  USERSITE: {
    USERSITE_CREATE: 'EXEC dbo.sp_InsertUserSite @idGroupement=:idGroupement, @idSite=:idSite, @active=:active',
    USERSITE_GET_BY_ID: 'EXEC dbo.sp_GetUserSiteById @id=:id',
    USERSITE_GET_ALL: 'EXEC dbo.sp_GetAllUserSites',
    USERSITE_UPDATE: 'EXEC dbo.sp_UpdateUserSite @id=:id, @idGroupement=:idGroupement, @idSite=:idSite, @active=:active',
    USERSITE_DELETE: 'EXEC dbo.sp_DeleteUserSite @id=:id',
    USERSITE_ACTIVATE: 'EXEC dbo.sp_ActivateUserSite @id=:id',
    USERSITE_DEACTIVATE: 'EXEC dbo.sp_DeactivateUserSite @id=:id',
    USERSITE_SEARCH: 'EXEC dbo.sp_SearchUserSite @idGroupement=:idGroupement, @groupement_name=:groupement_name, @idSite=:idSite, @site_type=:site_type, @onlyActive=:onlyActive',
    USERSITE_BY_GROUPEMENT: 'EXEC dbo.sp_GetUserSitesByGroupement @idGroupement=:idGroupement',
    USERSITE_BY_SITE: 'EXEC dbo.sp_GetUserSitesBySite @idSite=:idSite',
  },

  APPPARAMETER: {
    APPPARAMETER_CREATE: 'EXEC dbo.sp_AppParameter_Create @Key=:key, @Value=:value, @Description=:description, @Type=:type, @Scope=:scope, @Active=:active',
    APPPARAMETER_GET_BY_ID: 'EXEC dbo.sp_AppParameter_GetById @Id=:id',
    APPPARAMETER_GET_BY_KEY: 'EXEC dbo.sp_AppParameter_Get @Key=:key',
    
    // Updated with pagination
    APPPARAMETER_LIST: 'EXEC dbo.sp_AppParameter_List @Type=:type, @Scope=:scope, @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
    
    // Updated with pagination
    APPPARAMETER_SEARCH: 'EXEC dbo.sp_AppParameter_Search @q=:q, @Type=:type, @Scope=:scope, @OnlyActive=:onlyActive, @pageNumber=:pageNumber, @pageSize=:pageSize',
    
    APPPARAMETER_SET: 'EXEC dbo.sp_AppParameter_Set @Key=:key, @Value=:value, @Description=:description, @Type=:type, @Scope=:scope, @Active=:active',
    APPPARAMETER_UPDATE: 'EXEC dbo.sp_AppParameter_Update @Id=:id, @Key=:key, @Value=:value, @Description=:description, @Type=:type, @Scope=:scope, @Active=:active',
    APPPARAMETER_ACTIVATE: 'EXEC dbo.sp_AppParameter_Activate @Id=:id',
    APPPARAMETER_DEACTIVATE: 'EXEC dbo.sp_AppParameter_Deactivate @Id=:id',
    APPPARAMETER_DELETE: 'EXEC dbo.sp_AppParameter_Delete @Id=:id',
  },


  AUDITLOG: {
    AUDITLOG_COUNT_BY_DAY: 'EXEC dbo.usp_AuditLog_CountByDay @fromUtc=:fromUtc, @toUtc=:toUtc, @module=:module, @action=:action',
    AUDITLOG_COUNT_BY_HOUR: 'EXEC dbo.usp_AuditLog_CountByHour @fromUtc=:fromUtc, @toUtc=:toUtc, @module=:module, @action=:action',
    AUDITLOG_EXPORT_WINDOW: 'EXEC dbo.usp_AuditLog_ExportWindow @fromUtc=:fromUtc, @toUtc=:toUtc, @lastId=:lastId, @batchSize=:batchSize',
    AUDITLOG_GET_BY_ID: 'EXEC dbo.usp_AuditLog_GetById @id=:id',
    AUDITLOG_LATEST_PER_MODULE: 'EXEC dbo.usp_AuditLog_LatestPerModule',
    
    // Updated with pagination
    AUDITLOG_LIST_ACTIONS: 'EXEC dbo.usp_AuditLog_ListActions @module=:module, @pageNumber=:pageNumber, @pageSize=:pageSize',
    AUDITLOG_LIST_MODULES: 'EXEC dbo.usp_AuditLog_ListModules @pageNumber=:pageNumber, @pageSize=:pageSize',
    AUDITLOG_LIST_USERS: 'EXEC dbo.usp_AuditLog_ListUsers @module=:module, @action=:action, @pageNumber=:pageNumber, @pageSize=:pageSize',
    
    AUDITLOG_PURGE_ROLLING: 'EXEC dbo.usp_AuditLog_PurgeRolling @retainDays=:retainDays, @module=:module, @action=:action',
    AUDITLOG_TOP_ACTIONS: 'EXEC dbo.usp_AuditLog_TopActions @fromUtc=:fromUtc, @toUtc=:toUtc, @topN=:topN, @module=:module',
    AUDITLOG_TOP_USERS: 'EXEC dbo.usp_AuditLog_TopUsers @fromUtc=:fromUtc, @toUtc=:toUtc, @topN=:topN, @module=:module, @action=:action',
    AUDITLOG_WRITE: 'EXEC dbo.usp_AuditLog_Write @module=:module, @action=:action, @objectId=:objectId, @scope=:scope, @userId=:userId, @message=:message, @machineIp=:ip, @description=:description',
    AUDITLOG_WRITE_FROM_SESSION: 'EXEC dbo.usp_AuditLog_WriteFromSession @module=:module, @action=:action, @objectId=:objectId, @scope=:scope, @message=:message, @machineIp=:ip, @description=:description',
  },


  TYPE_PERIODE: {
    TYPE_PERIODE_CREATE: `
      EXEC dbo.sp_TypePeriode_Create
        @name = :name,
        @hebdomadaire = :hebdomadaire,
        @mensuel = :mensuel
    `,
    TYPE_PERIODE_UPDATE: `
      EXEC dbo.sp_TypePeriode_Update
        @id = :id,
        @name = :name,
        @hebdomadaire = :hebdomadaire,
        @mensuel = :mensuel
    `,
    TYPE_PERIODE_GET_BY_ID_ACTIVE: `
      EXEC dbo.sp_TypePeriode_GetByIdActive
        @id = :id
    `,
    TYPE_PERIODE_LIST_ACTIVE: `
      EXEC dbo.sp_TypePeriode_ListActive
    `,
    TYPE_PERIODE_ACTIVATE: `
      EXEC dbo.sp_TypePeriode_Activate
        @id = :id
    `,
    TYPE_PERIODE_DEACTIVATE: `
      EXEC dbo.sp_TypePeriode_Deactivate
        @id = :id
    `,
  },

  PERIODE: {
    PERIODE_CREATE: `
      EXEC dbo.sp_Periode_Create 
      @year = :year, 
      @month = :month, 
      @week = :week, 
      @startedDate = :startedDate, 
      @endDate = :endDate, 
      @typePeriodeId = :typePeriodeId
    `,
    PERIODE_UPDATE: `
      EXEC dbo.sp_Periode_Update 
      @id = :id, 
      @year = :year, 
      @month = :month, 
      @week = :week, 
      @startedDate = :startedDate, 
      @endDate = :endDate, 
      @typePeriodeId = :typePeriodeId
    `,
    PERIODE_GET_BY_ID_ACTIVE: `
      EXEC dbo.sp_Periode_GetByIdActive @id = :id
    `,
    // Updated with pagination
    PERIODE_LIST_ACTIVE: `
      EXEC dbo.sp_Periode_ListActive 
      @pageNumber = :pageNumber, 
      @pageSize = :pageSize
    `,
    PERIODE_ACTIVATE: `
      EXEC dbo.sp_Periode_Activate @id = :id
    `,
    PERIODE_DEACTIVATE: `
      EXEC dbo.sp_Periode_Deactivate @id = :id
    `,
    // Updated with pagination
    PERIODE_LIST_BY_TYPE: `
      EXEC dbo.sp_Periode_ListByType 
      @typePeriodeId = :typePeriodeId, 
      @typePeriodeName = :typePeriodeName, 
      @hebdomadaire = :hebdomadaire, 
      @mensuel = :mensuel, 
      @year = :year, 
      @month = :month,
      @pageNumber = :pageNumber,
      @pageSize = :pageSize
    `,
    // Updated with pagination
    PERIODE_LIST_YEARS: `
      EXEC dbo.sp_Periode_ListYears 
      @pageNumber = :pageNumber, 
      @pageSize = :pageSize
    `,
    // Updated with pagination
    PERIODE_LIST_BY_YEAR: `
      EXEC dbo.sp_Periode_ListByYear 
      @year = :year,
      @pageNumber = :pageNumber,
      @pageSize = :pageSize
    `,
  },

  
  TYPE_VENTE: {
    TYPE_VENTE_CREATE: `
      EXEC dbo.sp_TypeVente_Create
        @name = :name
    `,
    TYPE_VENTE_UPDATE: `
      EXEC dbo.sp_TypeVente_Update
        @id = :id,
        @name = :name
    `,
    TYPE_VENTE_GET_BY_ID_ACTIVE: `
      EXEC dbo.sp_TypeVente_GetByIdActive
        @id = :id
    `,
    TYPE_VENTE_LIST_ACTIVE: `
      EXEC dbo.sp_TypeVente_ListActive
    `,
    TYPE_VENTE_ACTIVATE: `
      EXEC dbo.sp_TypeVente_Activate
        @id = :id
    `,
    TYPE_VENTE_DEACTIVATE: `
      EXEC dbo.sp_TypeVente_Deactivate
        @id = :id
    `
  },

  TYPE_OBJECTIF: {
    TYPE_OBJECTIF_CREATE: `
      EXEC dbo.sp_TypeObjectif_Create
        @name = :name
    `,
    TYPE_OBJECTIF_UPDATE: `
      EXEC dbo.sp_TypeObjectif_Update
        @id = :id,
        @name = :name
    `,
    TYPE_OBJECTIF_GET_BY_ID_ACTIVE: `
      EXEC dbo.sp_TypeObjectif_GetByIdActive
        @id = :id
    `,
    TYPE_OBJECTIF_LIST_ACTIVE: `
      EXEC dbo.sp_TypeObjectif_ListActive
    `,
    TYPE_OBJECTIF_ACTIVATE: `
      EXEC dbo.sp_TypeObjectif_Activate
        @id = :id
    `,
    TYPE_OBJECTIF_DEACTIVATE: `
      EXEC dbo.sp_TypeObjectif_Deactivate
        @id = :id
    `
  },

  OBJECTIF: {
    OBJECTIF_CREATE: `
      EXEC dbo.sp_Objectif_Create
        @userId = :userId,
        @groupementId = :groupementId,
        @siteId = :siteId,
        @periodeId = :periodeId,
        @typeVenteId = :typeVenteId,
        @typeObjectifId = :typeObjectifId,
        @marqueId = :marqueId,
        @modeleId = :modeleId,
        @versionId = :versionId,
        @volume = :volume,
        @SalePrice = :SalePrice,
        @TMDirect = :TMDirect,
        @MargeInterGroupe = :MargeInterGroupe
    `,
    OBJECTIF_UPDATE: `
      EXEC dbo.sp_Objectif_Update
        @id = :id,
        @userId = :userId,
        @groupementId = :groupementId,
        @siteId = :siteId,
        @periodeId = :periodeId,
        @typeVenteId = :typeVenteId,
        @typeObjectifId = :typeObjectifId,
        @marqueId = :marqueId,
        @modeleId = :modeleId,
        @versionId = :versionId,
        @volume = :volume,
        @SalePrice = :SalePrice,
        @TMDirect = :TMDirect,
        @MargeInterGroupe = :MargeInterGroupe,
        @updatedUserId = :updatedUserId
    `,
    OBJECTIF_GET_BY_ID_ACTIVE: `
      EXEC dbo.sp_Objectif_GetByIdActive
        @id = :id
    `,
    
    // Updated with pagination
    OBJECTIF_LIST_ACTIVE: `
      EXEC dbo.sp_Objectif_ListActive
        @userId = :userId,
        @periodeId = :periodeId,
        @groupementId = :groupementId,
        @siteId = :siteId,
        @pageNumber = :pageNumber,
        @pageSize = :pageSize
    `,
    
    OBJECTIF_ACTIVATE: `
      EXEC dbo.sp_Objectif_Activate
        @id = :id
    `,
    OBJECTIF_DEACTIVATE: `
      EXEC dbo.sp_Objectif_Deactivate
        @id = :id
    `,
    
    // View query (you may want to add pagination here too if needed)
    OBJECTIF_VIEW: `
      SELECT * FROM dbo.V_Objectif
      WHERE (:userId IS NULL OR createdUserId = :userId)
      AND (:periodeId IS NULL OR periodeID = :periodeId)
      AND (:groupementId IS NULL OR groupementID = :groupementId)
      AND (:siteId IS NULL OR SiteID = :siteId)
      ORDER BY periodeID DESC, createdUserId ASC, id DESC
      `
  },

  USER_ACCESS: {
    // Updated with pagination
    GET_USER_PERMISSIONS: `
      EXEC dbo.usp_GetUserPermissions 
      @UserId=:userId, 
      @IncludeInactive=:includeInactive,
      @pageNumber=:pageNumber,
      @pageSize=:pageSize
    `,
    
    // Updated with pagination
    GET_USER_ROLES: `
      EXEC dbo.usp_GetUserRoles 
      @UserId=:userId, 
      @IncludeInactive=:includeInactive,
      @pageNumber=:pageNumber,
      @pageSize=:pageSize
    `
  },

  USER_ROLE: {
    // single link ops
    LINK: 'EXEC dbo.usp_UserRole_Link @UserId=:userId, @RoleId=:roleId, @Active=:active',
    UNLINK: 'EXEC dbo.usp_UserRole_Unlink @UserId=:userId, @RoleId=:roleId',
    SET_ACTIVE: 'EXEC dbo.usp_UserRole_SetActive @UserId=:userId, @RoleId=:roleId, @Active=:active',
    TOGGLE: 'EXEC dbo.usp_UserRole_Toggle @UserId=:userId, @RoleId=:roleId',

    // lookups
    LIST_ROLES_BY_USER: 'EXEC dbo.usp_UserRole_ListRolesByUser @UserId=:userId, @ActiveOnly=:activeOnly',
    LIST_USERS_BY_ROLE: 'EXEC dbo.usp_UserRole_ListUsersByRole @RoleId=:roleId, @ActiveOnly=:activeOnly',

    // bulk
    BULK_LINK_ROLES_TO_USER: 'EXEC dbo.usp_UserRole_BulkLinkRolesToUser @UserId=:userId, @RoleIds=:roleIds, @Active=:active',
    BULK_LINK_USERS_TO_ROLE: 'EXEC dbo.usp_UserRole_BulkLinkUsersToRole @RoleId=:roleId, @UserIds=:userIds, @Active=:active',
    BULK_SET_ACTIVE_BY_USER: 'EXEC dbo.usp_UserRole_BulkSetActiveByUser @UserId=:userId, @RoleIds=:roleIds, @Active=:active',
    BULK_SET_ACTIVE_BY_ROLE: 'EXEC dbo.usp_UserRole_BulkSetActiveByRole @RoleId=:roleId, @UserIds=:userIds, @Active=:active',

    // sync
    SYNC_ROLES_FOR_USER: 'EXEC dbo.usp_UserRole_SyncRolesForUser @UserId=:userId, @RoleIds=:roleIds, @Active=:active',
    SYNC_USERS_FOR_ROLE: 'EXEC dbo.usp_UserRole_SyncUsersForRole @RoleId=:roleId, @UserIds=:userIds, @Active=:active',

    // checks/stats
    HAS_ROLE: 'EXEC dbo.usp_UserRole_HasRole @UserId=:userId, @RoleId=:roleId, @ActiveOnly=:activeOnly',
    COUNT_USERS_FOR_ROLE: 'EXEC dbo.usp_UserRole_CountUsersForRole @RoleId=:roleId, @ActiveOnly=:activeOnly'
  }

};

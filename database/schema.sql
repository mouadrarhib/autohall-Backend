-- autohall.dbo.AppParameter definition

-- Drop table

-- DROP TABLE autohall.dbo.AppParameter;

CREATE TABLE autohall.dbo.AppParameter (
	id int IDENTITY(1,1) NOT NULL,
	[key] varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	value varchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	description varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[type] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	active bit DEFAULT 1 NOT NULL,
	createdAt datetime2(0) DEFAULT sysutcdatetime() NOT NULL,
	updatedAt datetime2(0) NULL,
	[scope] varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__AppParam__3213E83F84500371 PRIMARY KEY (id),
	CONSTRAINT UQ__AppParam__DFD83CAFB644DC17 UNIQUE ([key])
);


-- autohall.dbo.AuditLog definition

-- Drop table

-- DROP TABLE autohall.dbo.AuditLog;

CREATE TABLE autohall.dbo.AuditLog (
	id int IDENTITY(1,1) NOT NULL,
	[timestamp] datetime2(0) DEFAULT sysutcdatetime() NOT NULL,
	module varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	objectId int NULL,
	[scope] varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	userId varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	message varchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[action] varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	machineIp varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	description varchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__AuditLog__3213E83F9155D4F5 PRIMARY KEY (id)
);


-- autohall.dbo.Filiale definition

-- Drop table

-- DROP TABLE autohall.dbo.Filiale;

CREATE TABLE autohall.dbo.Filiale (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Filiale__3213E83F1765B370 PRIMARY KEY (id)
);


-- autohall.dbo.Groupement definition

-- Drop table

-- DROP TABLE autohall.dbo.Groupement;

CREATE TABLE autohall.dbo.Groupement (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Groupeme__3213E83F1C297761 PRIMARY KEY (id)
);


-- autohall.dbo.Permission definition

-- Drop table

-- DROP TABLE autohall.dbo.Permission;

CREATE TABLE autohall.dbo.Permission (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Permissi__3213E83F40251AAD PRIMARY KEY (id),
	CONSTRAINT UQ__Permissi__72E12F1B7E34A378 UNIQUE (name)
);


-- autohall.dbo.[Role] definition

-- Drop table

-- DROP TABLE autohall.dbo.[Role];

CREATE TABLE autohall.dbo.[Role] (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	description varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Role__3213E83F03FAEEF5 PRIMARY KEY (id),
	CONSTRAINT UQ__Role__72E12F1B5783713A UNIQUE (name)
);


-- autohall.dbo.Succursale definition

-- Drop table

-- DROP TABLE autohall.dbo.Succursale;

CREATE TABLE autohall.dbo.Succursale (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Succursa__3213E83F84671ECE PRIMARY KEY (id)
);


-- autohall.dbo.TypeObjectif definition

-- Drop table

-- DROP TABLE autohall.dbo.TypeObjectif;

CREATE TABLE autohall.dbo.TypeObjectif (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__TypeObje__3213E83FD18089BC PRIMARY KEY (id),
	CONSTRAINT UQ_TypeObjectif_name UNIQUE (name)
);


-- autohall.dbo.TypePeriode definition

-- Drop table

-- DROP TABLE autohall.dbo.TypePeriode;

CREATE TABLE autohall.dbo.TypePeriode (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	hebdomadaire bit DEFAULT 0 NOT NULL,
	mensuel bit DEFAULT 0 NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__TypePeri__3213E83F414E9AA4 PRIMARY KEY (id),
	CONSTRAINT UQ_TypePeriode_name UNIQUE (name)
);


-- autohall.dbo.TypeVente definition

-- Drop table

-- DROP TABLE autohall.dbo.TypeVente;

CREATE TABLE autohall.dbo.TypeVente (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__TypeVent__3213E83F8670584F PRIMARY KEY (id),
	CONSTRAINT UQ_TypeVente_name UNIQUE (name)
);


-- autohall.dbo.Marque definition

-- Drop table

-- DROP TABLE autohall.dbo.Marque;

CREATE TABLE autohall.dbo.Marque (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	idFiliale int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	imageUrl varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__Marque__3213E83F64AE606E PRIMARY KEY (id),
	CONSTRAINT FK_Marque_Filiale FOREIGN KEY (idFiliale) REFERENCES autohall.dbo.Filiale(id)
);


-- autohall.dbo.Modele definition

-- Drop table

-- DROP TABLE autohall.dbo.Modele;

CREATE TABLE autohall.dbo.Modele (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	idMarque int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	imageUrl varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__Modele__3213E83FB86CF389 PRIMARY KEY (id),
	CONSTRAINT FK_Modele_Marque FOREIGN KEY (idMarque) REFERENCES autohall.dbo.Marque(id)
);


-- autohall.dbo.Periode definition

-- Drop table

-- DROP TABLE autohall.dbo.Periode;

CREATE TABLE autohall.dbo.Periode (
	id int IDENTITY(1,1) NOT NULL,
	[year] int NOT NULL,
	[month] int NOT NULL,
	week int NOT NULL,
	startedDate date NOT NULL,
	endDate date NOT NULL,
	typePeriodeId int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	name AS ((CONVERT([char](10),[startedDate],(23))+' - ')+CONVERT([char](10),[endDate],(23))),
	CONSTRAINT PK__Periode__3213E83F2A6F1C66 PRIMARY KEY (id),
	CONSTRAINT UQ_Periode UNIQUE ([year],[month],week),
	CONSTRAINT FK_Periode_TypePeriode FOREIGN KEY (typePeriodeId) REFERENCES autohall.dbo.TypePeriode(id)
);


-- autohall.dbo.RolePermission definition

-- Drop table

-- DROP TABLE autohall.dbo.RolePermission;

CREATE TABLE autohall.dbo.RolePermission (
	idRole int NOT NULL,
	idPermission int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_RolePermission PRIMARY KEY (idRole,idPermission),
	CONSTRAINT FK_RolePermission_Permission FOREIGN KEY (idPermission) REFERENCES autohall.dbo.Permission(id),
	CONSTRAINT FK_RolePermission_Role FOREIGN KEY (idRole) REFERENCES autohall.dbo.[Role](id)
);


-- autohall.dbo.UserSite definition

-- Drop table

-- DROP TABLE autohall.dbo.UserSite;

CREATE TABLE autohall.dbo.UserSite (
	id int IDENTITY(1,1) NOT NULL,
	idGroupement int NOT NULL,
	idSite int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__UserSite__3213E83F0A159AA2 PRIMARY KEY (id),
	CONSTRAINT FK_UserSite_Groupement FOREIGN KEY (idGroupement) REFERENCES autohall.dbo.Groupement(id)
);


-- autohall.dbo.Version definition

-- Drop table

-- DROP TABLE autohall.dbo.Version;

CREATE TABLE autohall.dbo.Version (
	id int IDENTITY(1,1) NOT NULL,
	name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	idModele int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	SalePrice decimal(10,2) DEFAULT 0 NOT NULL,
	TMDirect decimal(5,2) DEFAULT 0 NOT NULL,
	TMInterGroupe decimal(5,2) DEFAULT 0 NOT NULL,
	volume int DEFAULT 0 NOT NULL,
	CONSTRAINT PK__Version__3213E83FB41F5E9E PRIMARY KEY (id),
	CONSTRAINT FK_Version_Modele FOREIGN KEY (idModele) REFERENCES autohall.dbo.Modele(id)
);
ALTER TABLE autohall.dbo.Version WITH NOCHECK ADD CONSTRAINT CHK_Version_TMDirect CHECK (([TMDirect]>=(0) AND [TMDirect]<=(30)));
ALTER TABLE autohall.dbo.Version WITH NOCHECK ADD CONSTRAINT CHK_Version_TMInterGroupe CHECK (([TMInterGroupe]>=(0) AND [TMInterGroupe]<=(30)));


-- autohall.dbo.[User] definition

-- Drop table

-- DROP TABLE autohall.dbo.[User];

CREATE TABLE autohall.dbo.[User] (
	id int IDENTITY(1,1) NOT NULL,
	full_name varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	email varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	username varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	password varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	idUserSite int NULL,
	actif bit NULL,
	createdAt datetime2(0) DEFAULT sysutcdatetime() NOT NULL,
	updatedAt datetime2(0) NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__User__3213E83F4FD6154B PRIMARY KEY (id),
	CONSTRAINT UQ__User__AB6E6164E12E658F UNIQUE (email),
	CONSTRAINT UQ__User__F3DBC572FFE608D5 UNIQUE (username),
	CONSTRAINT FK_User_UserSite FOREIGN KEY (idUserSite) REFERENCES autohall.dbo.UserSite(id)
);


-- autohall.dbo.UserPermission definition

-- Drop table

-- DROP TABLE autohall.dbo.UserPermission;

CREATE TABLE autohall.dbo.UserPermission (
	idUser int NOT NULL,
	idPermission int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_UserPermission PRIMARY KEY (idUser,idPermission),
	CONSTRAINT FK_UserPermission_Permission FOREIGN KEY (idPermission) REFERENCES autohall.dbo.Permission(id),
	CONSTRAINT FK_UserPermission_User FOREIGN KEY (idUser) REFERENCES autohall.dbo.[User](id)
);


-- autohall.dbo.UserRole definition

-- Drop table

-- DROP TABLE autohall.dbo.UserRole;

CREATE TABLE autohall.dbo.UserRole (
	idUser int NOT NULL,
	idRole int NOT NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_UserRole PRIMARY KEY (idUser,idRole),
	CONSTRAINT FK_UserRole_Role FOREIGN KEY (idRole) REFERENCES autohall.dbo.[Role](id),
	CONSTRAINT FK_UserRole_User FOREIGN KEY (idUser) REFERENCES autohall.dbo.[User](id)
);


-- autohall.dbo.Objectif definition

-- Drop table

-- DROP TABLE autohall.dbo.Objectif;

CREATE TABLE autohall.dbo.Objectif (
	id int IDENTITY(1,1) NOT NULL,
	userId int NOT NULL,
	groupementId int NOT NULL,
	siteId int NOT NULL,
	periodeId int NOT NULL,
	marqueId int NULL,
	modeleId int NULL,
	versionId int NULL,
	typeVenteId int NOT NULL,
	typeObjectifId int NOT NULL,
	volume int DEFAULT 0 NOT NULL,
	SalePrice decimal(18,2) DEFAULT 0 NOT NULL,
	TMDirect decimal(5,4) DEFAULT 0 NOT NULL,
	MargeInterGroupe decimal(5,4) DEFAULT 0 NOT NULL,
	createdAt datetime2(0) DEFAULT sysutcdatetime() NOT NULL,
	updatedAt datetime2(0) NULL,
	updatedUserId int NULL,
	active bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK__Objectif__3213E83F4BDAE01E PRIMARY KEY (id),
	CONSTRAINT FK_Objectif_Groupement FOREIGN KEY (groupementId) REFERENCES autohall.dbo.Groupement(id),
	CONSTRAINT FK_Objectif_Marque FOREIGN KEY (marqueId) REFERENCES autohall.dbo.Marque(id),
	CONSTRAINT FK_Objectif_Modele FOREIGN KEY (modeleId) REFERENCES autohall.dbo.Modele(id),
	CONSTRAINT FK_Objectif_Periode FOREIGN KEY (periodeId) REFERENCES autohall.dbo.Periode(id),
	CONSTRAINT FK_Objectif_TypeObjectif FOREIGN KEY (typeObjectifId) REFERENCES autohall.dbo.TypeObjectif(id),
	CONSTRAINT FK_Objectif_TypeVente FOREIGN KEY (typeVenteId) REFERENCES autohall.dbo.TypeVente(id),
	CONSTRAINT FK_Objectif_User FOREIGN KEY (userId) REFERENCES autohall.dbo.[User](id),
	CONSTRAINT FK_Objectif_Version FOREIGN KEY (versionId) REFERENCES autohall.dbo.Version(id)
);
 CREATE NONCLUSTERED INDEX IX_Objectif_Periode ON dbo.Objectif (  periodeId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Objectif_Product ON dbo.Objectif (  marqueId ASC  , modeleId ASC  , versionId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Objectif_User ON dbo.Objectif (  userId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
ALTER TABLE autohall.dbo.Objectif WITH NOCHECK ADD CONSTRAINT CK_Objectif_TMDirect_Max CHECK (([TMDirect]<=(0.40)));
ALTER TABLE autohall.dbo.Objectif WITH NOCHECK ADD CONSTRAINT CK_Objectif_MargeInterGroupe_Max CHECK (([MargeInterGroupe]<=(0.40)));
ALTER TABLE autohall.dbo.Objectif WITH NOCHECK ADD CONSTRAINT CK_Objectif_Product_AtLeastOne CHECK (([marqueId] IS NOT NULL OR [modeleId] IS NOT NULL OR [versionId] IS NOT NULL));
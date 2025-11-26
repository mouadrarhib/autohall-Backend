import { Router } from 'express';
import authRoutes from './auth.routes.js';
import permissionRoutes from './permission.routes.js';
import roleRoutes from './role.routes.js';
import marqueRoutes from './marque.routes.js';
import filialeRoutes from './filiale.routes.js';
import modeleRoutes from './modele.routes.js';
import versionRoutes from './version.routes.js';
import succursaleRoutes from './succursale.routes.js';
import groupementRoutes from './groupement.routes.js';
import userSiteRoutes from './usersite.routes.js';
import appParameterRoutes from './appparameter.routes.js';
import auditLogRoutes from './auditlog.routes.js';
import typePeriode from './typeperiode.routes.js';
import periodeRoute from './periode.routes.js';
import typeVenteRoutes from './typevente.routes.js';
import typeObjectifRoutes from './typeobjectif.routes.js';
import objectifRoutes from './objectif.routes.js';
import userRoleRoutes from './userRole.routes.js';
import rolePermissionRoutes  from './rolePermission.routes.js';
import ventesRoutes from './ventes.routes.js';
import predictionRoutes from './prediction.routes.js';


const router = Router();

router.get('/', (req, res) => res.json({ message: 'API root' }));
router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);
router.use('/roles', roleRoutes);
router.use('/marques', marqueRoutes);
router.use('/filiales', filialeRoutes);
router.use('/modeles', modeleRoutes);
router.use('/versions', versionRoutes);
router.use('/succursales', succursaleRoutes);
router.use('/groupements', groupementRoutes);
router.use('/user-sites', userSiteRoutes);
router.use('/app-parameters', appParameterRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/type-periode', typePeriode);
router.use('/periode', periodeRoute);
router.use('/type-ventes', typeVenteRoutes);
router.use('/type-objectifs', typeObjectifRoutes);
router.use('/objectifs', objectifRoutes);
router.use('/user-roles', userRoleRoutes);
router.use('/role-permissions', rolePermissionRoutes);
router.use('/ventes', ventesRoutes);
router.use('/predictions', predictionRoutes);



export default router;

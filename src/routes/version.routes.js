import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

import {
  validateVersionCreate,
  validateVersionUpdate,
  validateVersionId
} from '../middlewares/version/validateInput.js';

import {
  canCreateVersion,
  canReadVersion,
  canUpdateVersion
} from '../middlewares/version/hasPermission.js';

import * as controller from '../controllers/version.controller.js';

const router = express.Router();

router.use(isAuth);

router.post(
  '/',
  canCreateVersion,
  validateVersionCreate,
  controller.createVersion
);

router.get(
  '/:id',
  validateVersionId,
  canReadVersion,
  controller.getVersionById
);

router.get(
  '/',
  canReadVersion,
  controller.listVersions
);

router.get(
  '/by-modele',
  canReadVersion,
  controller.listVersionsByModele
);

router.get(
  '/search',
  canReadVersion,
  controller.searchVersions
);

router.patch(
  '/:id',
  validateVersionId,
  canUpdateVersion,
  validateVersionUpdate,
  controller.updateVersion
);

router.post(
  '/:id/activate',
  validateVersionId,
  canUpdateVersion,
  controller.activateVersion
);

router.post(
  '/:id/deactivate',
  validateVersionId,
  canUpdateVersion,
  controller.deactivateVersion
);

export default router;

// src/routes/prediction.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import { predictObjectives } from '../controllers/prediction.controller.js';

const router = express.Router();

router.use(isAuth);

router.post('/objectifs', predictObjectives);

router.use(errorHandler);

export default router;

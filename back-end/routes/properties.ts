import { Router } from 'express';
import * as propertiesController from '../controllers/propertiesController';

const router = Router();

router.get('/', propertiesController.getAllProperties);

export default router;


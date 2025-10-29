import { Router } from 'express';
import * as propertiesController from '../controllers/propertiesController';

const router = Router();

router.get('/', propertiesController.getAllProperties);
router.post('/createProperty', propertiesController.createProperty);

export default router;


import { Router } from 'express';
import * as propertiesController from '../controllers/propertiesController';

const router = Router();

router.get('/', propertiesController.getAllProperties);
router.post('/createProperty', propertiesController.createProperty);
router.get('/property/:property_id', propertiesController.getPropertyById);
export default router;


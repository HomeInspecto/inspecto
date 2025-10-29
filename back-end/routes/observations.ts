import { Router } from 'express';
import * as observationsController from '../controllers/observationsController';

const router = Router();

router.get('/', observationsController.getAllObservations);
router.post('/', observationsController.createObservation);

export default router;


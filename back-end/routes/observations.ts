import { Router } from 'express';
import * as observationsController from '../controllers/observationsController';

const router = Router();

router.get('/', observationsController.getAllObservations);
router.post('/createObservation', observationsController.createObservation);

export default router;


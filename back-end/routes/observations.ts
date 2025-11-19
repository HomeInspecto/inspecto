import { Router } from 'express';
import * as observationsController from '../controllers/observationsController';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// router.get('/all', observationsController.getAllObservations);
router.get('/by-inspection-and-section', observationsController.getObservationsByInspectionAndSection);
router.get('/by-inspection/:inspection_id', observationsController.getObservationsByInspectionId);
router.get('/observation/:observation_id', observationsController.getObservationById);
// Accepts multipart/form-data with optional files[]; uploads handled in controller
router.post('/createObservation', upload.array('files'), observationsController.createObservation);

export default router;


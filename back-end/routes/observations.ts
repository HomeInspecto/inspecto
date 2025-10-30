import { Router } from 'express';
import * as observationsController from '../controllers/observationsController';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get('/', observationsController.getAllObservations);
// Accepts multipart/form-data with optional files[]; uploads handled in controller
router.post('/createObservation', upload.array('files'), observationsController.createObservation);

export default router;


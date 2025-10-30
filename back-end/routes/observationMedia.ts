import { Router } from 'express';
import multer from 'multer';
import { createObservationMedia, getAllObservationMedia } from '../controllers/observationMedia';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

// List media for an observation
router.get('/:observation_id', getAllObservationMedia);

// Upload media file and create observation_media row (observation_id in URL)
router.post('/:observation_id', upload.single('file'), createObservationMedia);

export default router;



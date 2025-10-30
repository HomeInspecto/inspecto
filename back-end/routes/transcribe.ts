import { Router } from 'express';
import * as transcriptionController from '../controllers/transcriptionController';
import * as polishController from '../controllers/polishController';
import multer from 'multer';


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.post('/transcription',  upload.single('file'), transcriptionController.transcribeAudio);
router.post('/polish', polishController.polishTranscription);
router.post('/repolish', polishController.repolishTranscription);

export default router;
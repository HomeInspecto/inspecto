import { Router } from 'express';
import * as reportController from '../controllers/reportController';

const router = Router();

router.get('/generate/:inspection_id', reportController.generateReport);

export default router;
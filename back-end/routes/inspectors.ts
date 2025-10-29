import { Router } from 'express';
import * as inspectorsController from '../controllers/inspectorsController';

const router = Router();

router.get('/', inspectorsController.getAllInspectors);

export default router;


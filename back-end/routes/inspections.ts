import { Router } from 'express';
import * as inspectionsController from '../controllers/inspectionsController';

const router = Router();

router.get('/', inspectionsController.getAllInspections);
router.post('/', inspectionsController.createInspection);

export default router;


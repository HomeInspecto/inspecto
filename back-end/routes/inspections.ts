import { Router } from 'express';
import * as inspectionsController from '../controllers/inspectionsController';

const router = Router();

router.get('/', inspectionsController.getAllInspections);
router.post('/createInspection', inspectionsController.createInspection);
router.post('/createInspectionSection', inspectionsController.createInspectionSection);

export default router;


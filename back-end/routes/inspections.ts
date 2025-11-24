import { Router } from 'express';
import * as inspectionsController from '../controllers/inspectionsController';

const router = Router();

router.get('/all', inspectionsController.getAllInspections);
router.get('/inspection/:inspection_id', inspectionsController.getInspectionById);
router.post('/createInspection', inspectionsController.createInspection);
router.get('/byInspector/:inspector_id', inspectionsController.getInspectionsByInspectorId);

export default router;


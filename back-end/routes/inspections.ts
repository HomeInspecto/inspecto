import { Router } from 'express';
import * as inspectionsController from '../controllers/inspectionsController';

const router = Router();

router.get('/all', inspectionsController.getAllInspections);
router.get('/inspection/:inspection_id', inspectionsController.getInspectionById);
router.post('/createInspection', inspectionsController.createInspection);
router.post('/createInspectionSection', inspectionsController.createInspectionSection);
router.get('/sections/all', inspectionsController.getInspectionSectionsByInspectionId);
router.get('/sections/section/:section_id', inspectionsController.getInspectionSectionById);

export default router;


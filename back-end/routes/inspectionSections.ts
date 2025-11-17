import { Router } from 'express';
import * as inspectionSectionsController from '../controllers/inspectionSectionsController';

const router = Router();

router.get('/all', inspectionSectionsController.getAllInspectionSections);
router.get('/section/:section_id', inspectionSectionsController.getInspectionSectionById);
router.post('/create', inspectionSectionsController.createInspectionSection);

export default router;


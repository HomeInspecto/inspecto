import { Router } from 'express';
import * as organizationsController from '../controllers/organizationsController';

const router = Router();

router.get('/', organizationsController.getAllOrganizations);

export default router;


import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as confirmationController from '../controllers/confirmationController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/confirmation', confirmationController.getConfirmation);

export default router;


import { Router } from 'express';
import * as supabaseController from '../controllers/supabaseController';

const router = Router();

router.get('/test', supabaseController.testSupabaseConnection);

export default router;


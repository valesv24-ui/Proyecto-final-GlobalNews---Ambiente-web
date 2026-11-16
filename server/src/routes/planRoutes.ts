import { Router } from 'express';
import * as planController from '../controllers/planController.js';

const router = Router();

router.get('/', planController.listar);

export default router;

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validar } from '../middlewares/validar.js';
import { esquemaLogin, esquemaRegistro } from '../validators/authValidator.js';

const router = Router();

router.post('/registro', validar({ body: esquemaRegistro }), authController.registro);
router.post('/login', validar({ body: esquemaLogin }), authController.login);

export default router;

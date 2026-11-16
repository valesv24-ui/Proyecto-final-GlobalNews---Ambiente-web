import { Router, type Request, type Response } from 'express';
import authRoutes from './authRoutes.js';
import planRoutes from './planRoutes.js';

// Router principal: aquí se montan las rutas de cada módulo (auth, noticias, categorías...)
const router = Router();

// Ruta de prueba para verificar que la API está funcionando
router.get('/salud', (_req: Request, res: Response) => {
  res.json({ estado: 'ok', mensaje: 'API de GlobalNews funcionando' });
});

router.use('/auth', authRoutes);
router.use('/planes', planRoutes);

export default router;

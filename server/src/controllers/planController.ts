import type { Request, Response } from 'express';
import * as planModel from '../models/planModel.js';

// GET /api/planes - lista pública para el formulario de registro
export async function listar(_req: Request, res: Response): Promise<void> {
  const planes = await planModel.listarActivos();
  res.json({ ok: true, planes });
}

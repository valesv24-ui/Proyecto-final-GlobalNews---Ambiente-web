import type { Request, Response } from 'express';
import { ErrorNoAutenticado } from '../utils/errores.js';
import * as authService from '../services/authService.js';
import type { DatosLogin, DatosRegistro } from '../validators/authValidator.js';

/**
 * Los controladores solo leen la petición y envían la respuesta.
 * En Express 5, si una función async lanza un error, este llega solo
 * al manejador central de errores (no hace falta try/catch aquí).
 */

// POST /api/auth/registro
export async function registro(req: Request, res: Response): Promise<void> {
  const resultado = await authService.registrar(req.body as DatosRegistro);
  res.status(201).json({ ok: true, ...resultado });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const resultado = await authService.iniciarSesion(req.body as DatosLogin);
  res.json({ ok: true, ...resultado });
}

// GET /api/auth/perfil (requiere token)
export async function perfil(req: Request, res: Response): Promise<void> {
  if (!req.usuario) throw new ErrorNoAutenticado();
  const usuario = await authService.obtenerPerfil(req.usuario.id);
  res.json({ ok: true, usuario });
}

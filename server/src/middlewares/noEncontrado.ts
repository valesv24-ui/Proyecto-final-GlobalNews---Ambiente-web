import type { NextFunction, Request, Response } from 'express';
import { ErrorNoEncontrado } from '../utils/errores.js';

/**
 * Se monta después de todas las rutas: si ninguna respondió, la ruta no existe.
 * En vez de responder aquí, pasa un error 404 al manejador central.
 */
export function noEncontrado(req: Request, _res: Response, next: NextFunction): void {
  next(new ErrorNoEncontrado(`La ruta ${req.method} ${req.originalUrl} no existe`));
}

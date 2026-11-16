import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ErrorNoAutenticado, ErrorProhibido } from '../utils/errores.js';
import type { NombreRol, TokenPayload } from '../types/usuario.js';

/** Revisa que el contenido del token tenga la forma esperada */
function esTokenPayload(valor: unknown): valor is TokenPayload {
  if (typeof valor !== 'object' || valor === null) return false;
  const datos = valor as Record<string, unknown>;
  return typeof datos.id === 'number' && typeof datos.rol === 'string';
}

/**
 * Exige que la petición traiga un token válido en el encabezado:
 *   Authorization: Bearer <token>
 * Si es válido, guarda { id, rol } en req.usuario y continúa.
 * Si falta, está vencido o fue alterado, responde 401.
 */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith('Bearer ')) {
    next(new ErrorNoAutenticado('Debe iniciar sesión para continuar'));
    return;
  }

  const token = encabezado.slice('Bearer '.length).trim();
  try {
    const datos = jwt.verify(token, env.jwt.secreto);
    if (!esTokenPayload(datos)) throw new ErrorNoAutenticado('El token no es válido');
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ErrorNoAutenticado('Su sesión expiró, inicie sesión de nuevo'));
    } else {
      next(new ErrorNoAutenticado('El token no es válido'));
    }
  }
}

/**
 * Exige que el usuario tenga uno de los roles indicados. Se usa DESPUÉS de autenticar().
 * Ejemplo: router.post('/', autenticar, autorizar('administrador'), crearNoticia)
 * Si el rol no está permitido, responde 403 (sí inició sesión, pero no tiene permiso).
 */
export function autorizar(...rolesPermitidos: NombreRol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      next(new ErrorNoAutenticado());
      return;
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      next(new ErrorProhibido());
      return;
    }
    next();
  };
}

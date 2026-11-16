import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/errores.js';
import type { RespuestaError } from '../types/api.js';

/**
 * Códigos de error de PostgreSQL que se traducen a una respuesta clara.
 * Lista completa: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const ERRORES_POSTGRES: Record<string, { codigoHttp: number; mensaje: string }> = {
  '23505': { codigoHttp: 409, mensaje: 'Ya existe un registro con esos datos' },              // unique_violation
  '23503': { codigoHttp: 409, mensaje: 'El registro está relacionado con otros datos' },      // foreign_key_violation
  '23502': { codigoHttp: 400, mensaje: 'Falta un campo obligatorio' },                         // not_null_violation
  '23514': { codigoHttp: 400, mensaje: 'Un valor no cumple las reglas permitidas' },          // check_violation
  '22P02': { codigoHttp: 400, mensaje: 'Un valor tiene un formato inválido' },                // invalid_text_representation
  '22001': { codigoHttp: 400, mensaje: 'Un texto supera la longitud máxima permitida' },     // string_data_right_truncation
};

// Forma mínima de un error de la librería pg (trae un código de 5 caracteres)
interface ErrorPostgres extends Error {
  code: string;
  detail?: string;
}

function esErrorPostgres(error: unknown): error is ErrorPostgres {
  return error instanceof Error && typeof (error as Partial<ErrorPostgres>).code === 'string'
    && (error as ErrorPostgres).code.length === 5;
}

// express.json() lanza este error cuando el cuerpo no es un JSON válido
function esJsonInvalido(error: unknown): boolean {
  return error instanceof SyntaxError && (error as SyntaxError & { type?: string }).type === 'entity.parse.failed';
}

/**
 * Manejador central de errores: Express lo reconoce porque recibe 4 parámetros.
 * Todos los errores de la app terminan aquí, así el servidor nunca se cae
 * y siempre responde con el mismo formato JSON.
 */
export function manejadorErrores(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  let codigoHttp = 500;
  let mensaje = 'Ocurrió un error inesperado en el servidor';
  let detalles: unknown;

  if (error instanceof AppError) {
    // Errores lanzados a propósito por nuestro código
    codigoHttp = error.codigoHttp;
    mensaje = error.message;
    detalles = error.detalles;
  } else if (esJsonInvalido(error)) {
    codigoHttp = 400;
    mensaje = 'El cuerpo de la solicitud no es un JSON válido';
  } else if (esErrorPostgres(error) && ERRORES_POSTGRES[error.code]) {
    // Errores de la base de datos que tienen una causa conocida
    const conocido = ERRORES_POSTGRES[error.code];
    codigoHttp = conocido?.codigoHttp ?? 500;
    mensaje = conocido?.mensaje ?? mensaje;
    if (env.nodeEnv === 'development') detalles = error.detail;
  }

  // Los errores 500 se registran en consola para poder depurarlos
  if (codigoHttp >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, error);
    // En desarrollo se muestra la causa real; en producción no se exponen detalles internos
    if (env.nodeEnv === 'development' && error instanceof Error) detalles = error.message;
  }

  const respuesta: RespuestaError = {
    ok: false,
    error: { codigo: codigoHttp, mensaje, ...(detalles !== undefined && { detalles }) },
  };
  res.status(codigoHttp).json(respuesta);
}

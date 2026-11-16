import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { ErrorSolicitud } from '../utils/errores.js';

/** Esquemas opcionales para cada parte de la petición */
interface EsquemasPeticion {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/** Un error de validación asociado al campo que lo causó */
export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

/**
 * Convierte los errores de Zod en una lista simple { campo, mensaje },
 * fácil de mostrar en el formulario del frontend debajo de cada campo.
 */
export function formatearErroresZod(error: z.ZodError): ErrorCampo[] {
  return error.issues.map((issue) => ({
    campo: issue.path.join('.') || '(general)',
    mensaje: issue.message,
  }));
}

/**
 * Middleware de validación con Zod.
 * Uso en una ruta:  router.post('/', validar({ body: esquemaNoticia }), crearNoticia)
 *
 * Si los datos son válidos, los reemplaza por la versión ya limpia y convertida
 * (por ejemplo "5" -> 5 con z.coerce) y continúa al controlador.
 * Si no, lanza un error 400 con el detalle de cada campo inválido.
 */
export function validar(esquemas: EsquemasPeticion) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errores: ErrorCampo[] = [];

    if (esquemas.params) {
      const resultado = esquemas.params.safeParse(req.params);
      if (resultado.success) req.params = resultado.data as Request['params'];
      else errores.push(...formatearErroresZod(resultado.error));
    }

    if (esquemas.query) {
      const resultado = esquemas.query.safeParse(req.query);
      // En Express 5 req.query es de solo lectura, por eso se redefine la propiedad
      if (resultado.success) Object.defineProperty(req, 'query', { value: resultado.data, writable: true });
      else errores.push(...formatearErroresZod(resultado.error));
    }

    if (esquemas.body) {
      const resultado = esquemas.body.safeParse(req.body ?? {});
      if (resultado.success) req.body = resultado.data;
      else errores.push(...formatearErroresZod(resultado.error));
    }

    if (errores.length > 0) {
      next(new ErrorSolicitud('Los datos enviados no son válidos', errores));
      return;
    }
    next();
  };
}

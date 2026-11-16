import type { TokenPayload } from './usuario.js';

/**
 * Amplía el tipo Request de Express para agregar req.usuario.
 * El middleware autenticar() lo llena con los datos del token,
 * y así los controladores pueden usar req.usuario.id y req.usuario.rol con tipos.
 */
declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export {};

/** Nombres de los roles, tal como están en la tabla roles */
export type NombreRol = 'cliente' | 'publicitario' | 'administrador';

/** Usuario completo como sale de la base de datos (incluye el hash) */
export interface UsuarioBD {
  id: number;
  nombre: string;
  correo: string;
  contrasena_hash: string;
  rol: NombreRol;
  plan_id: number | null;
  plan: string | null;
  activo: boolean;
  creado_en: Date;
}

/** Usuario que se envía al frontend: nunca incluye el hash de la contraseña */
export type UsuarioPublico = Omit<UsuarioBD, 'contrasena_hash'>;

/** Datos que se guardan dentro del token JWT */
export interface TokenPayload {
  id: number;
  rol: NombreRol;
}

/** Respuesta de registro e inicio de sesión */
export interface RespuestaAuth {
  token: string;
  usuario: UsuarioPublico;
}

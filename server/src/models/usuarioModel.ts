import { pool } from '../config/db.js';
import type { NombreRol, UsuarioBD } from '../types/usuario.js';

/**
 * Modelo de usuarios: solo contiene las consultas SQL.
 * Todas usan parámetros ($1, $2...) para evitar inyección SQL.
 */

// Columnas comunes: une usuarios con su rol y su plan
const SELECT_USUARIO = `
  SELECT u.id, u.nombre, u.correo, u.contrasena_hash, r.nombre AS rol,
         u.plan_id, p.nombre AS plan, u.activo, u.creado_en
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  LEFT JOIN planes_suscripcion p ON p.id = u.plan_id
`;

export async function buscarPorCorreo(correo: string): Promise<UsuarioBD | null> {
  const { rows } = await pool.query<UsuarioBD>(`${SELECT_USUARIO} WHERE u.correo = $1`, [correo]);
  return rows[0] ?? null;
}

export async function buscarPorId(id: number): Promise<UsuarioBD | null> {
  const { rows } = await pool.query<UsuarioBD>(`${SELECT_USUARIO} WHERE u.id = $1`, [id]);
  return rows[0] ?? null;
}

interface NuevoUsuario {
  nombre: string;
  correo: string;
  contrasenaHash: string;
  rol: NombreRol;
  planId: number;
}

/** Inserta el usuario buscando el id del rol por su nombre y devuelve el id creado */
export async function crear(datos: NuevoUsuario): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol_id, plan_id)
     VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = $4), $5)
     RETURNING id`,
    [datos.nombre, datos.correo, datos.contrasenaHash, datos.rol, datos.planId],
  );
  const fila = rows[0];
  if (!fila) throw new Error('No se pudo crear el usuario');
  return fila.id;
}

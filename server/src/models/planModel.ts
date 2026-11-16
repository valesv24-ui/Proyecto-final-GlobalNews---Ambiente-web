import { pool } from '../config/db.js';
import type { Plan } from '../types/plan.js';

/** Planes activos, del más barato al más caro */
export async function listarActivos(): Promise<Plan[]> {
  const { rows } = await pool.query<Plan>(
    `SELECT id, nombre, descripcion, precio_mensual
     FROM planes_suscripcion WHERE activo = TRUE ORDER BY precio_mensual`,
  );
  return rows;
}

export async function existeActivo(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    'SELECT 1 FROM planes_suscripcion WHERE id = $1 AND activo = TRUE', [id]);
  return (rowCount ?? 0) > 0;
}

import pg from 'pg';
import { env } from './env.js';

/**
 * Pool de conexiones a PostgreSQL.
 * Un pool mantiene varias conexiones abiertas y las reutiliza,
 * así no se abre una conexión nueva en cada consulta.
 */
export const pool = new pg.Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
});

// Si una conexión inactiva del pool falla, se registra el error en vez de tumbar el servidor
pool.on('error', (error: Error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

/**
 * Verifica que la base de datos responda.
 * Se llama al iniciar el servidor para detectar errores de configuración temprano.
 */
export async function probarConexion(): Promise<void> {
  const resultado = await pool.query<{ ahora: Date }>('SELECT NOW() AS ahora');
  console.log(`Conectado a PostgreSQL (${env.db.name}) - ${resultado.rows[0]?.ahora.toISOString()}`);
}

export default pool;

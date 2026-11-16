import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../src/config/db.js';

/**
 * Ejecuta un archivo .sql contra la base configurada en el .env.
 * Uso: npm run db:schema   (o: npx tsx scripts/ejecutarSql.ts database/archivo.sql)
 * Sirve para no depender de que psql esté en el PATH de Windows.
 */
async function ejecutar(): Promise<void> {
  const archivo = process.argv[2];
  if (!archivo) {
    console.error('Indique el archivo .sql a ejecutar. Ejemplo: npx tsx scripts/ejecutarSql.ts database/schema.sql');
    process.exit(1);
  }

  const ruta = path.resolve(archivo);
  try {
    const sql = await readFile(ruta, 'utf8');
    await pool.query(sql);
    console.log(`Script ejecutado correctamente: ${archivo}`);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`Error al ejecutar ${archivo}: ${mensaje}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

ejecutar();

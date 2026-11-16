import app from './app.js';
import { env } from './config/env.js';
import { probarConexion } from './config/db.js';

// Punto de entrada: primero verifica la base de datos y luego levanta el servidor
async function iniciar(): Promise<void> {
  try {
    await probarConexion();
    app.listen(env.port, () => {
      console.log(`${app.get('appName')} corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('No se pudo conectar a PostgreSQL:', mensaje);
    console.error('Revise las variables DB_* del archivo .env y que el servicio de PostgreSQL esté encendido.');
    process.exit(1);
  }
}

iniciar();

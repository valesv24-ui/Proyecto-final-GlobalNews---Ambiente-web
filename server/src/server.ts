import app from './app.js';
import { env } from './config/env.js';
import { probarConexion } from './config/db.js';

/**
 * Arma un mensaje legible a partir del error de conexión.
 * Cuando "localhost" falla por IPv6 y por IPv4, Node devuelve un AggregateError
 * sin mensaje propio, así que se leen los errores internos y su código (ej. ECONNREFUSED).
 */
function describirError(error: unknown): string {
  if (error instanceof AggregateError) {
    return error.errors.map((e: unknown) => describirError(e)).join(' | ');
  }
  if (error instanceof Error) {
    const codigo = (error as NodeJS.ErrnoException).code;
    return codigo ? `${codigo} - ${error.message}` : error.message;
  }
  return String(error);
}

// Punto de entrada: primero verifica la base de datos y luego levanta el servidor
async function iniciar(): Promise<void> {
  try {
    await probarConexion();
    app.listen(env.port, () => {
      console.log(`${app.get('appName')} corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', describirError(error));
    console.error('Revise las variables DB_* del archivo .env y que el servicio de PostgreSQL esté encendido.');
    process.exit(1);
  }
}

// Última red de seguridad: registra promesas rechazadas que nadie capturó
process.on('unhandledRejection', (razon: unknown) => {
  console.error('Promesa rechazada sin manejar:', describirError(razon));
});

iniciar();

import app from './app.js';
import { env } from './config/env.js';

// Punto de entrada: levanta el servidor en el puerto configurado
app.listen(env.port, () => {
  console.log(`${app.get('appName')} corriendo en http://localhost:${env.port}`);
});

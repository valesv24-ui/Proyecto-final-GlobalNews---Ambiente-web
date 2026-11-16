import express, { type Application } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import rutas from './routes/index.js';
import { noEncontrado } from './middlewares/noEncontrado.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';

// Se crea y configura la aplicación de Express (sin levantar el servidor)
const app: Application = express();

// Configuraciones
app.set('appName', 'GlobalNews API');

// Middlewares
app.use(cors({ origin: env.clientUrl })); // permite peticiones desde el frontend
app.use(express.json());                  // lee el JSON del cuerpo de la petición

// Rutas: todas las rutas de la API cuelgan de /api
app.use('/api', rutas);

// Manejo de errores: SIEMPRE al final, después de todas las rutas
app.use(noEncontrado);      // 404 para rutas que no existen
app.use(manejadorErrores);  // respuesta única para cualquier error

export default app;

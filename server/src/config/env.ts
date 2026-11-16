import dotenv from 'dotenv';

// Carga las variables definidas en el archivo .env
dotenv.config();

// Interfaz con las variables de entorno que usa la aplicación
interface Env {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
}

// Objeto único de configuración: el resto del código lee de aquí y no de process.env
export const env: Env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'globalnews',
  },
};

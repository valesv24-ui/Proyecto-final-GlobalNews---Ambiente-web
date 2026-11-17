import type { ErrorCampo, RespuestaError } from '../types/api';

/** URL base de la API, se configura en el archivo .env (VITE_API_URL) */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

/** Clave con la que se guarda el token en localStorage */
const CLAVE_TOKEN = 'globalnews_token';

export const tokenStorage = {
  obtener: (): string | null => localStorage.getItem(CLAVE_TOKEN),
  guardar: (token: string): void => localStorage.setItem(CLAVE_TOKEN, token),
  borrar: (): void => localStorage.removeItem(CLAVE_TOKEN),
};

/**
 * Error que lanzan las funciones de servicio cuando la API responde con error.
 * Las pantallas pueden mostrar error.message y, en formularios, error.errorDeCampo('correo').
 */
export class ErrorApi extends Error {
  readonly codigo: number;
  readonly detalles?: unknown;

  constructor(codigo: number, mensaje: string, detalles?: unknown) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.detalles = detalles;
  }

  /** Mensaje de error de un campo del formulario (si el servidor lo envió) */
  errorDeCampo(campo: string): string | undefined {
    if (!Array.isArray(this.detalles)) return undefined;
    return (this.detalles as ErrorCampo[]).find((d) => d.campo === campo)?.mensaje;
  }
}

function esRespuestaError(datos: unknown): datos is RespuestaError {
  return typeof datos === 'object' && datos !== null && (datos as RespuestaError).ok === false
    && typeof (datos as RespuestaError).error?.mensaje === 'string';
}

/**
 * Función única para llamar a la API con fetch.
 * - Agrega el token automáticamente si el usuario inició sesión.
 * - Convierte el cuerpo a JSON (o deja pasar FormData para subir imágenes).
 * - Si la respuesta es un error, lanza ErrorApi con el mensaje del servidor.
 *
 * Ejemplo: const datos = await peticion<{ planes: Plan[] }>('/planes');
 */
export async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const encabezados = new Headers(opciones.headers);
  const token = tokenStorage.obtener();
  if (token) encabezados.set('Authorization', `Bearer ${token}`);
  if (opciones.body && !(opciones.body instanceof FormData)) {
    encabezados.set('Content-Type', 'application/json');
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, headers: encabezados });
  } catch {
    // fetch solo falla así cuando no hay conexión con el servidor
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Verifique que la API esté encendida.');
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    if (esRespuestaError(datos)) {
      throw new ErrorApi(datos.error.codigo, datos.error.mensaje, datos.error.detalles);
    }
    throw new ErrorApi(respuesta.status, 'Ocurrió un error inesperado');
  }
  return datos as T;
}

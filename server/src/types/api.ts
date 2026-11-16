/**
 * Formato único de las respuestas de error de la API.
 * El frontend siempre puede leer error.mensaje para mostrarlo al usuario.
 */
export interface RespuestaError {
  ok: false;
  error: {
    codigo: number;
    mensaje: string;
    detalles?: unknown;
  };
}

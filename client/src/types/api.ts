/** Error de un campo, tal como lo envía el middleware validar() del servidor */
export interface ErrorCampo {
  campo: string;
  mensaje: string;
}

/** Formato de las respuestas de error del servidor */
export interface RespuestaError {
  ok: false;
  error: {
    codigo: number;
    mensaje: string;
    detalles?: unknown;
  };
}

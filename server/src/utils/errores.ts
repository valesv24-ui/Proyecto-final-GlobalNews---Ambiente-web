/**
 * Error propio de la aplicación.
 * Lleva el código HTTP que se debe responder, así los controladores y servicios
 * solo hacen "throw" y el middleware central arma la respuesta.
 */
export class AppError extends Error {
  public readonly codigoHttp: number;
  public readonly detalles?: unknown;

  constructor(codigoHttp: number, mensaje: string, detalles?: unknown) {
    super(mensaje);
    this.name = 'AppError';
    this.codigoHttp = codigoHttp;
    this.detalles = detalles;
  }
}

// Atajos para los errores más comunes, con un mensaje por defecto en español

/** 400 - Los datos enviados no son válidos */
export class ErrorSolicitud extends AppError {
  constructor(mensaje = 'La solicitud contiene datos inválidos', detalles?: unknown) {
    super(400, mensaje, detalles);
    this.name = 'ErrorSolicitud';
  }
}

/** 401 - No inició sesión o el token no es válido */
export class ErrorNoAutenticado extends AppError {
  constructor(mensaje = 'Debe iniciar sesión para continuar') {
    super(401, mensaje);
    this.name = 'ErrorNoAutenticado';
  }
}

/** 403 - Inició sesión, pero su rol no tiene permiso */
export class ErrorProhibido extends AppError {
  constructor(mensaje = 'No tiene permisos para realizar esta acción') {
    super(403, mensaje);
    this.name = 'ErrorProhibido';
  }
}

/** 404 - El recurso no existe */
export class ErrorNoEncontrado extends AppError {
  constructor(mensaje = 'El recurso solicitado no existe') {
    super(404, mensaje);
    this.name = 'ErrorNoEncontrado';
  }
}

/** 409 - Conflicto con datos existentes (ej. correo ya registrado) */
export class ErrorConflicto extends AppError {
  constructor(mensaje = 'El recurso ya existe o está en uso') {
    super(409, mensaje);
    this.name = 'ErrorConflicto';
  }
}

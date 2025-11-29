/**
 * Clase base para errores customizados de la aplicación
 */
export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantener el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error para recursos no encontrados (404)
 */
export class NotFoundError extends CustomError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/**
 * Error para conflictos (409)
 */
export class ConflictError extends CustomError {
  constructor(message = 'Conflicto en la operación') {
    super(message, 409);
  }
}

/**
 * Error para datos inválidos (400)
 */
export class BadRequestError extends CustomError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400);
  }
}

/**
 * Error para recursos no autorizados (401)
 */
export class UnauthorizedError extends CustomError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

/**
 * Error para acceso prohibido (403)
 */
export class ForbiddenError extends CustomError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

/**
 * Error interno del servidor (500)
 */
export class InternalServerError extends CustomError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
  }
}

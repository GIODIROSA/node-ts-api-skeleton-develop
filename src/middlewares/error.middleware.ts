/**
 * @fileoverview Middleware global de manejo de errores
 *
 * Este middleware captura y procesa todos los errores que ocurren en la
 * aplicación, proporcionando respuestas consistentes y logging detallado.
 *
 * Maneja diferentes tipos de errores:
 * - CustomError: Errores de negocio con status codes específicos
 * - AxiosError: Errores de peticiones HTTP externas
 * - Error genérico: Cualquier otro error no esperado
 *
 * @module middlewares/error.middleware
 * @requires @config/custom-error - Clase de errores personalizados
 * @requires @config/logger - Sistema de logging
 * @requires axios - Cliente HTTP
 * @requires express - Framework web
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { CustomError } from '@config/custom-error';
import Logger from '@config/logger';
import { ValidationMessages } from '@constants/validation-messages';
import { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';

/**
 * Logger específico para el módulo de manejo de errores
 */
const logger = new Logger('error.middleware');

/**
 * Estructura de detalles para errores personalizados (CustomError)
 *
 * @interface CustomErrorDetails
 * @property {number} statusCode - Código de estado HTTP del error
 * @property {string} message - Mensaje descriptivo del error
 * @property {string} [traceId] - ID de traza para tracking
 * @property {string} method - Método HTTP de la petición
 * @property {string} url - URL de la petición que generó el error
 * @property {unknown} body - Body de la petición
 * @property {unknown} params - Parámetros de ruta
 * @property {unknown} query - Parámetros de query string
 */
interface CustomErrorDetails {
  statusCode: number;
  message: string;
  traceId?: string;
  method: string;
  url: string;
  body: unknown;
  params: unknown;
  query: unknown;
}

/**
 * Estructura de detalles específicos para errores de Axios
 *
 * Captura información relevante de errores en peticiones HTTP externas.
 *
 * @interface AxiosErrorDetails
 * @property {number} [status] - Código de estado HTTP de la respuesta
 * @property {string} [statusText] - Texto del estado HTTP
 * @property {unknown} [responseData] - Datos de la respuesta de error
 * @property {string} [requestUrl] - URL de la petición que falló
 * @property {string} [requestMethod] - Método HTTP usado
 * @property {unknown} [requestData] - Datos enviados en la petición
 * @property {string} [errorCode] - Código de error de Axios (ECONNREFUSED, etc.)
 */
interface AxiosErrorDetails {
  status?: number;
  statusText?: string;
  responseData?: unknown;
  requestUrl?: string;
  requestMethod?: string;
  requestData?: unknown;
  errorCode?: string;
}

/**
 * Estructura de detalles para errores genéricos
 *
 * Incluye información básica del error y contexto de la petición.
 *
 * @interface GenericErrorDetails
 * @property {string} error - Mensaje del error
 * @property {string} [stack] - Stack trace del error
 * @property {string} [traceId] - ID de traza para tracking
 * @property {unknown} body - Body de la petición
 * @property {unknown} params - Parámetros de ruta
 * @property {unknown} query - Parámetros de query string
 * @property {AxiosErrorDetails} [axiosError] - Detalles adicionales si es error de Axios
 */
interface GenericErrorDetails {
  error: string;
  stack?: string;
  traceId?: string;
  body: unknown;
  params: unknown;
  query: unknown;
  axiosError?: AxiosErrorDetails;
}

/**
 * Middleware global para manejo centralizado de errores
 *
 * Este middleware debe ser registrado **AL FINAL** de todos los middlewares
 * y rutas para poder capturar cualquier error que ocurra en la aplicación.
 *
 * @function errorHandler
 * @param {Error} error - Error capturado
 * @param {Request} req - Objeto request de Express
 * @param {Response} res - Objeto response de Express
 * @param {NextFunction} next - Función para pasar al siguiente middleware
 * @returns {void | Response} Response con el error formateado
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import errorHandler from './middlewares/error.middleware';
 *
 * const app = express();
 *
 * // Registrar rutas...
 * app.use('/api', routes);
 *
 * // Registrar error handler AL FINAL
 * app.use(errorHandler);
 * ```
 *
 * @remarks
 * **Tipos de errores manejados:**
 *
 * 1. **CustomError**: Errores de negocio con status code específico
 *    - Responde con el status code y mensaje del error
 *    - Ejemplo: new CustomError('Usuario no encontrado', 404)
 *
 * 2. **AxiosError**: Errores de peticiones HTTP externas
 *    - Captura detalles de la petición y respuesta fallida
 *    - Loguea información completa para debugging
 *    - Responde con error genérico al cliente (no expone detalles internos)
 *
 * 3. **Error genérico**: Cualquier otro error no esperado
 *    - Loguea stack trace completo
 *    - Responde con mensaje genérico (no expone detalles internos)
 *    - Status code: 500
 *
 * **Seguridad:**
 * - No expone stack traces ni detalles internos al cliente
 * - Usa mensajes genéricos para errores no controlados
 * - Loguea toda la información necesaria para debugging
 *
 * **Logging:**
 * - CustomError: logger.error con detalles del error
 * - Otros errores: logger.error con stack trace completo
 * - Incluye traceId para correlación de logs
 *
 * @see {@link CustomError} - Clase para errores personalizados
 * @see {@link ValidationMessages} - Mensajes de error estándar
 */
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  // Detectar si es un error customizado
  if (error instanceof CustomError) {
    const errorDetails: CustomErrorDetails = {
      statusCode: error.statusCode,
      message: error.message,
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
    };

    logger.error(
      `Error customizado [${error.statusCode}] en ${req.method} ${req.originalUrl}: ${error.message}`
    );
    logger.error(`Detalles: ${JSON.stringify(errorDetails)}`);

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Detectar si es un error de Axios
  const isAxiosError = error instanceof AxiosError;

  const errorDetails: GenericErrorDetails = {
    error: error.message,
    stack: error.stack,
    traceId: req.traceId,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Si es un error de Axios, agregar detalles específicos
  if (isAxiosError) {
    const axiosError = error as AxiosError;
    const axiosDetails: AxiosErrorDetails = {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      responseData: axiosError.response?.data,
      requestUrl: axiosError.config?.url,
      requestMethod: axiosError.config?.method,
      requestData: axiosError.config?.data,
      errorCode: axiosError.code,
    };

    errorDetails.axiosError = axiosDetails;
  }

  // Log del error con detalles
  logger.error(`Error en ${req.method} ${req.originalUrl}`, errorDetails);

  // Respuesta estándar de error
  const errorResponse = {
    success: false,
    message: ValidationMessages.REQUEST_PROCESSING,
  };

  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return next(error);
  }

  // Enviar respuesta de error
  res.status(500).json(errorResponse);
};

export default errorHandler;

/**
 * @fileoverview Middleware de auditoría para logging de requests y responses
 *
 * Este middleware captura información detallada de cada petición HTTP
 * para propósitos de auditoría, debugging y monitoreo. Incluye:
 * - Datos del request (método, URL, headers, body, query params)
 * - Datos del response (status code, body, tiempo de respuesta)
 * - Sanitización de información sensible (passwords, tokens, etc.)
 *
 * @module middlewares/audit.middleware
 * @requires @config/logger - Sistema de logging
 * @requires express - Framework web
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import Logger from '@config/logger';
import { NextFunction, Request, Response } from 'express';

/**
 * Logger específico para el módulo de auditoría
 */
const logger = new Logger('audit.middleware');

/**
 * Estructura de datos de auditoría para requests
 *
 * @interface AuditData
 * @property {string} traceId - ID único de la petición para tracking
 * @property {string} method - Método HTTP (GET, POST, PUT, etc.)
 * @property {string} url - URL completa de la petición
 * @property {string} ip - Dirección IP del cliente
 * @property {string} [userAgent] - User agent del cliente
 * @property {Record<string, unknown>} headers - Headers HTTP sanitizados
 * @property {unknown} [body] - Body del request sanitizado
 * @property {Record<string, unknown>} query - Query parameters
 * @property {Record<string, unknown>} params - Route parameters
 * @property {string} timestamp - Timestamp ISO 8601 de la petición
 */
interface AuditData {
  traceId: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  headers: Record<string, unknown>;
  body?: unknown;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  timestamp: string;
}

/**
 * Estructura de datos de auditoría para responses
 *
 * Extiende AuditData con información específica de la respuesta.
 *
 * @interface ResponseAuditData
 * @extends AuditData
 * @property {number} statusCode - Código de estado HTTP de la respuesta
 * @property {number} responseTime - Tiempo de respuesta en milisegundos
 * @property {unknown} [responseBody] - Body de la respuesta sanitizado
 * @property {Record<string, unknown>} responseHeaders - Headers de respuesta sanitizados
 */
interface ResponseAuditData extends AuditData {
  statusCode: number;
  responseTime: number;
  responseBody?: unknown;
  responseHeaders: Record<string, unknown>;
}

/**
 * Middleware de auditoría para logging de requests y responses
 *
 * Intercepta cada petición HTTP y registra información detallada tanto
 * del request como del response. Implementa sanitización automática de
 * datos sensibles y excluye endpoints de health check.
 *
 * @function auditMiddleware
 * @param {Request} req - Objeto request de Express
 * @param {Response} res - Objeto response de Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void}
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import auditMiddleware from './middlewares/audit.middleware';
 *
 * const app = express();
 * app.use(auditMiddleware);
 * ```
 *
 * @remarks
 * **Características:**
 * - Excluye automáticamente endpoints de health check (/health, /api/health)
 * - Mide el tiempo de respuesta de cada petición
 * - Sanitiza información sensible (passwords, tokens, API keys)
 * - Intercepta res.send() y res.json() para capturar el response body
 * - Determina el nivel de log según el status code (debug/info/warn/error)
 *
 * **Niveles de log:**
 * - 2xx: debug
 * - 3xx: info
 * - 4xx: warn
 * - 5xx: error
 *
 * @see {@link sanitizeHeaders} - Sanitización de headers
 * @see {@link sanitizeBody} - Sanitización de request body
 * @see {@link sanitizeResponseBody} - Sanitización de response body
 */
const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Excluir endpoints de health check del logging
  const excludedPaths = ['/health', '/api/health'];
  const currentPath = req.originalUrl || req.url;

  if (excludedPaths.includes(currentPath)) {
    return next();
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Capturar datos del request
  const requestData: AuditData = {
    traceId: req.traceId || 'unknown',
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    headers: sanitizeHeaders(req.headers),
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    timestamp,
  };

  // Loguear el request
  logger.debug(
    `REQUEST: ${req.method} ${
      req.originalUrl || req.url
    } | Data: ${JSON.stringify(requestData)}`
  );

  // Interceptar el response
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody: unknown;

  // Override res.send
  res.send = function (body: unknown) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function (body: unknown) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Interceptar cuando la response termina
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseData: ResponseAuditData = {
      ...requestData,
      statusCode: res.statusCode,
      responseTime,
      responseBody: sanitizeResponseBody(responseBody, res.statusCode),
      responseHeaders: sanitizeHeaders(res.getHeaders()),
    };

    // Determinar el nivel de log basado en el status code
    const logLevel = getLogLevel(res.statusCode);
    const message = `RESPONSE: ${req.method} ${req.originalUrl || req.url} - ${
      res.statusCode
    } - ${responseTime}ms | Data: ${JSON.stringify(responseData)}`;

    logger[logLevel](message);
  });

  next();
};

/**
 * Sanitiza headers HTTP removiendo información sensible
 *
 * Reemplaza valores de headers sensibles con '[REDACTED]' para
 * prevenir la exposición de credenciales en logs.
 *
 * @function sanitizeHeaders
 * @param {Record<string, unknown>} headers - Headers HTTP a sanitizar
 * @returns {Record<string, unknown>} Headers sanitizados
 *
 * @example
 * ```typescript
 * const headers = {
 *   'authorization': 'Bearer token123',
 *   'content-type': 'application/json'
 * };
 * const sanitized = sanitizeHeaders(headers);
 * // { authorization: '[REDACTED]', 'content-type': 'application/json' }
 * ```
 *
 * @remarks
 * **Headers sensibles que se redactan:**
 * - authorization
 * - cookie
 * - x-api-key
 * - x-auth-token
 */
function sanitizeHeaders(
  headers: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
  ];

  sensitiveHeaders.forEach((header) => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitiza el body del request removiendo información sensible
 *
 * Reemplaza valores de campos sensibles con '[REDACTED]' para
 * prevenir la exposición de información confidencial en logs.
 *
 * @function sanitizeBody
 * @param {unknown} body - Body del request a sanitizar
 * @returns {unknown} Body sanitizado o el valor original si no es un objeto
 *
 * @example
 * ```typescript
 * const body = {
 *   username: 'user@example.com',
 *   password: 'secret123',
 *   data: 'some data'
 * };
 * const sanitized = sanitizeBody(body);
 * // { username: 'user@example.com', password: '[REDACTED]', data: 'some data' }
 * ```
 *
 * @remarks
 * **Campos sensibles que se redactan:**
 * - password
 * - token
 * - secret
 * - key
 * - pin
 * - cvv
 * - newPassword
 */
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized: Record<string, unknown> = {
    ...(body as Record<string, unknown>),
  };
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'pin',
    'cvv',
    'newPassword',
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitiza el body de la response
 *
 * Aplica sanitización al response body, truncando responses grandes
 * y redactando campos sensibles. Mantiene errores completos para debugging.
 *
 * @function sanitizeResponseBody
 * @param {unknown} body - Body de la response a sanitizar
 * @param {number} statusCode - Código de estado HTTP de la response
 * @returns {unknown} Body sanitizado
 *
 * @example
 * ```typescript
 * const body = { token: 'abc123', data: 'result' };
 * const sanitized = sanitizeResponseBody(body, 200);
 * // { token: '[REDACTED]', data: 'result' }
 * ```
 *
 * @remarks
 * **Comportamiento:**
 * - Errores (4xx, 5xx): Se mantienen sin cambios para debugging
 * - Strings grandes (>1000 chars): Se truncan con indicador de tamaño
 * - Objetos: Se redactan campos sensibles
 *
 * **Campos sensibles que se redactan:**
 * - password
 * - token
 * - secret
 * - key
 * - newPassword
 */
function sanitizeResponseBody(body: unknown, statusCode: number): unknown {
  // No loguear el body completo para responses grandes o errores
  if (statusCode >= 400) {
    return body; // Mantener errores para debugging
  }

  if (typeof body === 'string' && body.length > 1000) {
    return `[LARGE_RESPONSE: ${body.length} characters]`;
  }

  if (typeof body === 'object' && body !== null) {
    const sanitized: Record<string, unknown> = {
      ...(body as Record<string, unknown>),
    };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'newPassword',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  return body;
}

/**
 * Determina el nivel de log apropiado según el status code HTTP
 *
 * Mapea códigos de estado HTTP a niveles de log para facilitar
 * el filtrado y análisis de logs.
 *
 * @function getLogLevel
 * @param {number} statusCode - Código de estado HTTP
 * @returns {'debug' | 'info' | 'warn' | 'error'} Nivel de log apropiado
 *
 * @example
 * ```typescript
 * getLogLevel(200); // 'debug'
 * getLogLevel(301); // 'info'
 * getLogLevel(404); // 'warn'
 * getLogLevel(500); // 'error'
 * ```
 *
 * @remarks
 * **Mapeo de status codes:**
 * - 2xx (Success): debug
 * - 3xx (Redirect): info
 * - 4xx (Client Error): warn
 * - 5xx (Server Error): error
 */
function getLogLevel(statusCode: number): 'debug' | 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  if (statusCode >= 300) return 'info';
  return 'debug';
}

export default auditMiddleware;

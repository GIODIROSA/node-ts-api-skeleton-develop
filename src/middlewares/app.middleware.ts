/**
 * @fileoverview Configuración y registro de middlewares de la aplicación
 *
 * Este módulo centraliza el registro de todos los middlewares de Express,
 * asegurando que se apliquen en el orden correcto para el funcionamiento
 * óptimo de la aplicación.
 *
 * @module middlewares/app.middleware
 * @requires express - Framework web
 * @requires helmet - Seguridad HTTP headers
 * @requires @config/logger - Sistema de logging
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import Logger from '@config/logger';
import express, { Express } from 'express';
import helmet from 'helmet';
import auditMiddleware from './audit.middleware';
import configureCors from './cors.middleware';
import errorHandler from './error.middleware';
import traceMiddleware from './trace.middleware';

/**
 * Logger específico para el módulo de middlewares
 */
const logger = new Logger('app.middleware');

/**
 * Registra todos los middlewares comunes de la aplicación
 *
 * Esta función configura la cadena de middlewares en el orden correcto.
 * El orden es crítico para el funcionamiento correcto de la aplicación.
 *
 * @function registerMiddleware
 * @param {Express} app - Instancia de la aplicación Express
 * @returns {void}
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { registerMiddleware } from './middlewares/app.middleware';
 *
 * const app = express();
 * registerMiddleware(app);
 * ```
 *
 * @remarks
 * **Orden de los middlewares:**
 * 1. **CORS** - Debe ir primero para manejar preflight OPTIONS requests
 * 2. **Helmet** - Configura headers de seguridad HTTP
 * 3. **TraceId** - Asigna ID único a cada request para tracking
 * 4. **Body Parsers** - Parsea JSON y URL-encoded bodies
 * 5. **Audit** - Registra información de requests/responses
 *
 * **Límites configurados:**
 * - Body size: 10MB máximo para JSON y URL-encoded
 *
 * @see {@link registerErrorHandling} - Debe llamarse después de registrar rutas
 */
export const registerMiddleware = (app: Express): void => {
  logger.info('Registrando middlewares de la aplicación...');

  // CORS - debe ir primero para manejar preflight OPTIONS requests
  logger.debug('Configurando CORS middleware');
  app.use(configureCors());

  // Seguridad HTTP headers
  logger.debug('Configurando Helmet middleware');
  app.use(helmet());

  // TraceId para tracking de requests
  logger.debug('Configurando TraceId middleware');
  app.use(traceMiddleware);

  // Parseo de JSON y URL-encoded (debe ir antes del audit para capturar el body)
  logger.debug('Configurando body parsers');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Auditoría para logging de requests/responses
  logger.debug('Configurando Audit middleware');
  app.use(auditMiddleware);

  logger.info('Middlewares registrados exitosamente');
};

/**
 * Registra el middleware global de manejo de errores
 *
 * Este middleware debe ser registrado **DESPUÉS** de todas las rutas
 * para poder capturar cualquier error que ocurra en la aplicación.
 *
 * @function registerErrorHandling
 * @param {Express} app - Instancia de la aplicación Express
 * @returns {void}
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { registerMiddleware, registerErrorHandling } from './middlewares/app.middleware';
 *
 * const app = express();
 *
 * // 1. Registrar middlewares comunes
 * registerMiddleware(app);
 *
 * // 2. Registrar rutas
 * app.use('/api', routes);
 *
 * // 3. Registrar manejo de errores (SIEMPRE AL FINAL)
 * registerErrorHandling(app);
 * ```
 *
 * @remarks
 * **Importante:**
 * - Debe ser la última función llamada en la configuración de la app
 * - Captura errores de todas las rutas y middlewares anteriores
 * - Maneja tanto errores síncronos como asíncronos
 * - Formatea respuestas de error de manera consistente
 *
 * @see {@link errorHandler} - Implementación del middleware de errores
 */
export const registerErrorHandling = (app: Express): void => {
  logger.info('Registrando middleware de manejo de errores...');

  // Middleware global de manejo de errores (debe ir al final)
  app.use(errorHandler);

  logger.info('Middleware de errores registrado exitosamente');
};

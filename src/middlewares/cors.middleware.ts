/**
 * @fileoverview Configuración de CORS (Cross-Origin Resource Sharing)
 *
 * Este módulo configura las políticas de CORS para la aplicación,
 * controlando qué orígenes externos pueden acceder a la API.
 *
 * CORS es un mecanismo de seguridad del navegador que restringe
 * peticiones HTTP entre diferentes dominios. Este middleware permite
 * configurar qué orígenes están autorizados.
 *
 * @module middlewares/cors.middleware
 * @requires cors - Middleware de CORS para Express
 * @requires @config/constants - Variables de entorno
 * @requires @config/logger - Sistema de logging
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { ENV } from '@config/constants';
import Logger from '@config/logger';
import cors from 'cors';

/**
 * Logger específico para el módulo de CORS
 */
const logger = new Logger('cors.middleware');

/**
 * Configura el middleware de CORS para la aplicación
 *
 * Lee los orígenes permitidos desde las variables de entorno (CORS_ORIGINS)
 * y configura el middleware de CORS con las políticas apropiadas.
 *
 * @function configureCors
 * @returns {cors.CorsOptions} Middleware de CORS configurado
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import configureCors from './middlewares/cors.middleware';
 *
 * const app = express();
 * app.use(configureCors());
 * ```
 *
 * @remarks
 * **Configuración:**
 * - Orígenes: Leídos desde ENV.CORS_ORIGINS (separados por comas)
 * - Credentials: Habilitado (permite cookies y headers de autenticación)
 * - Métodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS
 * - Headers permitidos: Content-Type, Authorization, X-Requested-With
 *
 * **Comportamiento especial:**
 * - Peticiones sin origen (curl, Postman, apps móviles): Siempre permitidas
 * - Wildcard (*): Si está en CORS_ORIGINS, permite todos los orígenes
 * - Error de configuración: Fallback a configuración permisiva
 *
 * **Variables de entorno:**
 * - CORS_ORIGINS: Lista de orígenes separados por comas
 *   Ejemplo: "http://localhost:3000,https://app.example.com"
 *
 * @throws {Error} Si hay error parseando CORS_ORIGINS (se captura internamente)
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS}
 */
export const configureCors = () => {
  try {
    // Convertir CORS_ORIGINS a array, eliminando espacios en blanco
    const allowedOrigins = ENV.CORS_ORIGINS.split(',').map((origin) =>
      origin.trim()
    );

    logger.debug(
      `CORS configurado con orígenes permitidos: ${allowedOrigins.join(', ')}`
    );

    return cors({
      /**
       * Validador de origen personalizado
       * @param {string | undefined} origin - Origen de la petición
       * @param {Function} callback - Callback para indicar si el origen es válido
       */
      origin: (origin, callback) => {
        // Permitir peticiones sin origen (curl, Postman, apps móviles nativas)
        if (!origin) {
          return callback(null, true);
        }

        // Verificar si el origen está en la lista de permitidos o es wildcard
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        } else {
          logger.warn(`CORS: Origin ${origin} no permitido`);
          return callback(
            new Error(`Origin ${origin} not allowed by CORS policy`)
          );
        }
      },
      // Permitir credenciales (cookies, headers de autenticación)
      credentials: true,
      // Métodos HTTP permitidos
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      // Headers permitidos en las peticiones
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
  } catch (error) {
    logger.error('Error configurando CORS:', error);
    // Retornar una configuración básica en caso de error
    return cors({
      origin: true,
      credentials: true,
    });
  }
};

export default configureCors;

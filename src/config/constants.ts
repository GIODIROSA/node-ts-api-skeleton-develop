/**
 * @fileoverview Gestión centralizada de variables de entorno y constantes de la aplicación.
 *
 * Este archivo proporciona un punto único de acceso a todas las variables de entorno
 * necesarias para la aplicación, con validación automática de variables obligatorias.
 *
 * @module constants
 *
 * @description
 * Características principales:
 * - Validación automática de variables obligatorias al inicio de la aplicación
 * - Conversión de tipos (string a number, boolean, etc.)
 * - Mensajes de error descriptivos cuando faltan variables requeridas
 * - Organización por categorías (API, Database, Logging, Security, etc.)
 *
 * @example
 * ```typescript
 * import { ENV } from './constants';
 *
 * // Acceder a variables de entorno validadas
 * const port = ENV.PORT;
 * const dbUser = ENV.DB_USER;
 * ```
 *
 * @requires dotenv - Para cargar variables desde archivo .env
 * @see .env.example - Archivo de referencia con todas las variables disponibles
 */

import dotenv from 'dotenv';
dotenv.config();

// Las variables de entorno ya fueron cargadas en server.ts
const ENVIRONMENT_VALUES = process.env;

/**
 * Valida y obtiene una variable de entorno obligatoria.
 *
 * @param variable - Nombre de la variable de entorno a obtener
 * @returns El valor de la variable de entorno
 * @throws {Error} Si la variable no está definida o está vacía
 *
 * @example
 * ```typescript
 * const dbUser = requireEnv('DB_USER'); // Retorna el valor o lanza error
 * ```
 */
function requireEnv(variable: string): string {
  const value = ENVIRONMENT_VALUES[variable];
  if (!value) {
    console.error(
      `❌ ERROR CRÍTICO: Variable de entorno obligatoria no encontrada: ${variable}`
    );
    console.error(
      `📋 Variables de entorno disponibles:`,
      Object.keys(ENVIRONMENT_VALUES).filter(
        (k) => !k.includes('SECRET') && !k.includes('PASSWORD')
      )
    );
    throw new Error(
      `Variable de entorno obligatoria no encontrada: ${variable}`
    );
  }
  return value;
}

/**
 * Objeto de constantes con todas las variables de entorno de la aplicación.
 *
 * @constant
 * @type {Object}
 *
 * @property {Object} API - Configuración de la API
 * @property {number} API.PORT - Puerto en el que se ejecutará el servidor (default: 3000)
 * @property {string} API.NODE_ENV - Ambiente de ejecución (dev, uat, prd)
 * @property {string} API.API_PATH - Ruta base para los endpoints de la API
 *
 * @property {Object} DATABASE - Configuración de base de datos PostgreSQL
 * @property {string} DATABASE.DB_USER - Usuario de la base de datos
 * @property {string} DATABASE.DB_PASSWORD - Contraseña de la base de datos
 * @property {string} DATABASE.DB_NAME - Nombre de la base de datos
 * @property {number} DATABASE.DB_PORT - Puerto de la base de datos (default: 5432)
 * @property {boolean} DATABASE.RUN_SEED - Ejecutar seed al iniciar (true/false)
 * @property {string} DATABASE.PRISMA_LOG_LEVEL - Niveles de log de Prisma (query, error, warn, info)
 *
 * @property {Object} LOGGING - Configuración de logging
 * @property {string} LOGGING.LOG_LEVEL - Nivel de logging (error, warn, info, debug, trace)
 * @property {string} LOGGING.LOG_PATH - Ruta donde se almacenarán los archivos de log
 * @property {string} LOGGING.LOG_NAME - Nombre del servicio para identificar los logs
 *
 * @property {Object} RATE_LIMIT - Configuración de rate limiting
 * @property {boolean} RATE_LIMIT.RATE_LIMIT_HEADERS - Incluir headers de rate limiting en las respuestas
 * @property {number} RATE_LIMIT.RATE_LIMIT_MAX_REQUESTS - Número máximo de requests permitidos por ventana
 * @property {string} RATE_LIMIT.RATE_LIMIT_MESSAGE - Mensaje cuando se excede el límite
 * @property {number} RATE_LIMIT.RATE_LIMIT_WINDOW_MS - Ventana de tiempo en milisegundos
 *
 * @property {Object} CORS - Configuración de CORS
 * @property {string} CORS.CORS_ORIGINS - Orígenes permitidos (separados por coma)
 *
 * @property {Object} JWT - Configuración de JWT y autenticación
 * @property {string} JWT.JWT_SECRET - Secreto para firmar los tokens JWT
 * @property {string} JWT.JWT_ACCESS_EXPIRATION - Tiempo de expiración del access token (ej: 15m, 1h, 7d)
 * @property {string} JWT.JWT_REFRESH_EXPIRATION - Tiempo de expiración del refresh token (ej: 7d, 30d)
 *
 * @property {Object} ENCRYPTION - Configuración de encriptación
 * @property {string} ENCRYPTION.ENCRYPTION_KEY - Clave de encriptación para datos sensibles (32 bytes base64)
 * @property {string} ENCRYPTION.ENCRYPTION_SALT - Salt para derivación de clave (64 bytes base64)
 *
 * @example
 * ```typescript
 * import { ENV } from './constants';
 *
 * // Usar configuración de la API
 * app.listen(ENV.PORT, () => {
 *   console.log(`Server running on port ${ENV.PORT}`);
 * });
 *
 * // Usar configuración de base de datos
 * const connection = await createConnection({
 *   user: ENV.DB_USER,
 *   password: ENV.DB_PASSWORD,
 *   database: ENV.DB_NAME,
 *   port: ENV.DB_PORT
 * });
 * ```
 */
export const ENV = {
  // =============================================================================
  // CONFIGURACIÓN DE LA API
  // =============================================================================
  PORT: Number(requireEnv('PORT')),
  NODE_ENV: requireEnv('NODE_ENV'),
  API_PATH: requireEnv('API_PATH'),

  // =============================================================================
  // CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
  // =============================================================================
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: requireEnv('DB_PASSWORD'),
  DB_NAME: requireEnv('DB_NAME'),
  DB_PORT: Number(requireEnv('DB_PORT')),
  RUN_SEED: requireEnv('RUN_SEED') === 'true',
  PRISMA_LOG_LEVEL: requireEnv('PRISMA_LOG_LEVEL'),

  // =============================================================================
  // CONFIGURACIÓN DE LOGGING
  // =============================================================================
  LOG_LEVEL: requireEnv('LOG_LEVEL'),
  LOG_PATH: requireEnv('LOG_PATH'),
  LOG_NAME: requireEnv('LOG_NAME'),

  // =============================================================================
  // CONFIGURACIÓN DE RATE LIMITING
  // =============================================================================
  RATE_LIMIT_HEADERS: requireEnv('RATE_LIMIT_HEADERS') === 'true',
  RATE_LIMIT_MAX_REQUESTS: Number(requireEnv('RATE_LIMIT_MAX_REQUESTS')),
  RATE_LIMIT_MESSAGE: requireEnv('RATE_LIMIT_MESSAGE'),
  RATE_LIMIT_WINDOW_MS: Number(requireEnv('RATE_LIMIT_WINDOW_MS')),

  // =============================================================================
  // CONFIGURACIÓN DE CORS
  // =============================================================================
  CORS_ORIGINS: requireEnv('CORS_ORIGINS'),

  // =============================================================================
  // CONFIGURACIÓN DE JWT Y AUTENTICACIÓN
  // =============================================================================
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_ACCESS_EXPIRATION: requireEnv('JWT_ACCESS_EXPIRATION'),
  JWT_REFRESH_EXPIRATION: requireEnv('JWT_REFRESH_EXPIRATION'),

  // =============================================================================
  // CONFIGURACIÓN DE ENCRIPTACIÓN
  // =============================================================================
  ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY'),
  ENCRYPTION_SALT: requireEnv('ENCRYPTION_SALT'),
};

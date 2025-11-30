/**
 * @fileoverview Sistema de enrutamiento centralizado
 *
 * Este archivo centraliza todas las rutas de la aplicación,
 * permitiendo un registro ordenado y mantenible de endpoints.
 *
 * @module v1/routes
 * @requires @config/constants - Variables de entorno
 * @requires express - Framework web
 * @requires @config/logger - Sistema de logging
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { ENV } from '@config/constants';
import { Router } from 'express';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';

import Logger from '@config/logger';
import path from 'path';

const { API_PATH } = ENV;

/**
 * Logger para el sistema de rutas
 */
const logger = new Logger('routes');

/**
 * Ruta base de la API
 * @constant {string} base
 */
const base = `${API_PATH}`;

logger.info(`Ruta base: ${base}`);

/**
 * Configuración de rutas de la aplicación
 *
 * Array que contiene todas las rutas con sus respectivos prefijos y routers.
 * Cada entrada define un módulo de rutas que se montará en la aplicación.
 *
 * @constant {Array<{path: string, router: Router}>} routes
 *
 * @property {string} path - Prefijo de la ruta (ej: '/', '/api/v1/users')
 * @property {Router} router - Router de Express con los endpoints del módulo
 *
 * @example
 * ```typescript
 * // Añadir un nuevo módulo de rutas:
 * {
 *   path: `${base}/posts`,
 *   router: postRoutes,
 * }
 * ```
 *
 * @remarks
 * **Estructura de rutas:**
 * - `/` - Health check y endpoints raíz
 * - `/api/v1/users` - Gestión de usuarios
 * - `/api/v1/...` - Otros módulos
 */
export const routes = [
  {
    path: '/',
    router: healthRoutes,
  },
  {
    path: `${base}/users`,
    router: userRoutes,
  },
  {
    path: `${base}/products`,
    router: productRoutes,
  }
];


/**
 * Registra todas las rutas en la aplicación Express
 *
 * Itera sobre el array de rutas y monta cada router en su respectivo prefijo.
 * Este método es llamado desde app.ts durante la inicialización.
 *
 * @function registerRoutes
 * @param {Router} app - Instancia de Express o Router donde montar las rutas
 * @returns {void}
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { registerRoutes } from './v1/routes';
 *
 * const app = express();
 * registerRoutes(app);
 * ```
 *
 * @remarks
 * - Las rutas se registran en el orden definido en el array `routes`
 * - Cada router puede tener sus propios middlewares específicos
 * - Los prefijos se concatenan (ej: app base + route path)
 */


export const registerRoutes = (app: Router): void => {
  routes.forEach((route) => {
    app.use(route.path, route.router);
    logger.debug(`Ruta registrada: ${route.path}`);
  });
};

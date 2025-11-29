/**
 * @fileoverview Configuración principal de la aplicación Express
 *
 * Este archivo define la clase App que encapsula toda la configuración
 * de la aplicación Express, incluyendo middlewares, rutas y manejo de errores.
 *
 * @module app
 * @requires @middlewares/app.middleware - Registro de middlewares
 * @requires express - Framework web
 * @requires ./v1/routes - Registro de rutas
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import {
  registerErrorHandling,
  registerMiddleware,
} from '@middlewares/app.middleware';
import express, { Express } from 'express';
import { registerRoutes } from './v1/routes';

/**
 * Clase principal de la aplicación
 *
 * Encapsula la configuración de Express y el orden de inicialización
 * de middlewares, rutas y manejo de errores.
 *
 * @class App
 *
 * @example
 * ```typescript
 * const appInstance = new App();
 * const expressApp = appInstance.getApp();
 * ```
 *
 * @remarks
 * **Orden de inicialización (IMPORTANTE):**
 * 1. Middlewares globales (CORS, body-parser, etc.)
 * 2. Rutas de la aplicación
 * 3. Middleware de manejo de errores (DEBE ir al final)
 */
class App {
  /**
   * Instancia de Express
   * @public
   * @type {Express}
   */
  public app: Express;

  /**
   * Constructor de la aplicación
   *
   * Inicializa Express y configura todos los componentes en el orden correcto.
   *
   * @constructor
   */
  constructor() {
    // Inicializar express
    this.app = express();

    // Configurar la aplicación en orden específico
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Inicializa los middlewares globales
   *
   * Registra todos los middlewares que deben ejecutarse antes de las rutas:
   * - CORS
   * - Body parser (JSON, URL-encoded)
   * - Helmet (seguridad)
   * - Trace ID
   * - Audit logging
   *
   * @private
   * @method initializeMiddlewares
   * @returns {void}
   *
   * @remarks
   * Este método DEBE ejecutarse antes de registrar las rutas
   */
  private initializeMiddlewares(): void {
    // Registrar todos los middleware comunes
    registerMiddleware(this.app);
  }

  /**
   * Inicializa las rutas de la aplicación
   *
   * Registra todas las rutas definidas en el sistema de routing centralizado.
   * Las rutas se montan con sus respectivos prefijos (ej: /api/v1/users).
   *
   * @private
   * @method initializeRoutes
   * @returns {void}
   *
   * @see {@link registerRoutes} - Función que registra las rutas
   *
   * @remarks
   * - Este método debe ejecutarse después de los middlewares globales
   * - Debe ejecutarse antes del middleware de manejo de errores
   */
  private initializeRoutes(): void {
    // Registrar todas las rutas desde el archivo centralizado
    registerRoutes(this.app);
  }

  /**
   * Inicializa el manejo de errores
   *
   * Registra el middleware de manejo de errores global.
   * Este middleware captura todos los errores que ocurran en la aplicación
   * y los formatea en respuestas HTTP consistentes.
   *
   * @private
   * @method initializeErrorHandling
   * @returns {void}
   *
   * @remarks
   * **IMPORTANTE:** Este middleware DEBE registrarse AL FINAL,
   * después de todas las rutas, para que pueda capturar
   * todos los errores que ocurran.
   */
  private initializeErrorHandling(): void {
    // Registrar middleware de manejo de errores (DEBE ir al final)
    registerErrorHandling(this.app);
  }

  /**
   * Obtiene la instancia de Express configurada
   *
   * Retorna la aplicación Express completamente configurada,
   * lista para ser usada por el servidor HTTP.
   *
   * @public
   * @method getApp
   * @returns {Express} Instancia de Express configurada
   *
   * @example
   * ```typescript
   * const app = new App();
   * const expressApp = app.getApp();
   * expressApp.listen(3000);
   * ```
   */
  public getApp(): Express {
    return this.app;
  }
}

/**
 * Instancia singleton de la aplicación
 *
 * Se crea una única instancia de App y se exporta la aplicación Express
 * configurada para ser usada en server.ts
 *
 * @constant {Express} app - Aplicación Express configurada
 */
const appInstance = new App();
export default appInstance.getApp();

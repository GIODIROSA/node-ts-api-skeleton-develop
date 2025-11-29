/**
 * @fileoverview Middleware de Trace ID para tracking de peticiones
 *
 * Este middleware asigna un identificador único (trace ID) a cada petición
 * HTTP que ingresa a la aplicación. Este ID permite:
 * - Rastrear una petición a través de múltiples servicios
 * - Correlacionar logs relacionados con la misma petición
 * - Facilitar debugging en arquitecturas distribuidas
 * - Implementar observabilidad y monitoreo
 *
 * @module middlewares/trace.middleware
 * @requires @config/trace-context - Contexto de traza para AsyncLocalStorage
 * @requires express - Framework web
 * @requires uuid - Generador de UUIDs
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import traceContext from '@config/trace-context';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extensión del tipo Request de Express para incluir traceId
 *
 * Permite acceder a req.traceId en cualquier handler o middleware
 * sin errores de TypeScript.
 *
 * @augments express.Request
 * @property {string} [traceId] - ID único de traza de la petición
 */
declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
  }
}

/**
 * Middleware para generar y gestionar IDs de traza en las peticiones
 *
 * Asigna un ID único (UUID v4) a cada petición HTTP. Si la petición
 * ya incluye un header 'x-trace-id', se reutiliza ese ID para mantener
 * la trazabilidad entre servicios.
 *
 * @function traceMiddleware
 * @param {Request} req - Objeto request de Express
 * @param {Response} res - Objeto response de Express
 * @param {NextFunction} next - Función para continuar al siguiente middleware
 * @returns {void}
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import traceMiddleware from './middlewares/trace.middleware';
 *
 * const app = express();
 *
 * // Registrar trace middleware temprano en la cadena
 * app.use(traceMiddleware);
 *
 * // Usar el traceId en handlers
 * app.get('/api/users', (req, res) => {
 *   console.log(`TraceID: ${req.traceId}`);
 *   // ...
 * });
 * ```
 *
 * @remarks
 * **Funcionamiento:**
 * 1. Verifica si existe header 'x-trace-id' en la petición
 * 2. Si existe, usa ese ID (permite tracing distribuido)
 * 3. Si no existe, genera un nuevo UUID v4
 * 4. Almacena el ID en req.traceId para acceso fácil
 * 5. Establece el ID en el contexto de traza (AsyncLocalStorage)
 *
 * **Beneficios:**
 * - **Debugging**: Correlaciona logs de la misma petición
 * - **Distributed Tracing**: Mantiene el ID entre microservicios
 * - **Observabilidad**: Facilita el monitoreo y análisis
 * - **Auditoría**: Rastrea el flujo completo de una petición
 *
 * **Integración con otros servicios:**
 * Para propagar el trace ID a servicios externos, incluye el header:
 * ```typescript
 * axios.get('https://api.example.com', {
 *   headers: { 'x-trace-id': req.traceId }
 * });
 * ```
 *
 * @see {@link traceContext} - Contexto de traza usando AsyncLocalStorage
 */
const traceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  req.traceId = traceId; // Guardar en el objeto request para acceso fácil

  // Establecer el ID de traza en el contexto
  traceContext.setTraceId(traceId);

  // Continuar con la solicitud
  next();
};

export default traceMiddleware;

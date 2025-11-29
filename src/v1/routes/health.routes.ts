/**
 * @fileoverview Rutas de health check
 *
 * Define endpoints para verificar el estado y salud de la aplicación.
 * Útil para monitoreo, load balancers y sistemas de orquestación.
 *
 * @module v1/routes/health.routes
 * @requires express - Framework web
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { Request, Response, Router } from 'express';

/**
 * Router de Express para health check
 */
const router = Router();

/**
 * @route GET /health
 * @description Endpoint de health check para verificar el estado de la aplicación
 * @access Público
 * @returns {Object} 200 - Estado de la aplicación
 * @returns {string} status - Estado del servicio ('ok' si está funcionando)
 * @returns {string} timestamp - Fecha y hora actual en formato ISO
 * @returns {number} uptime - Tiempo de ejecución del proceso en segundos
 * @returns {string} environment - Ambiente de ejecución (development, production, etc.)
 *
 * @example
 * ```bash
 * curl http://localhost:3000/health
 * ```
 *
 * @example
 * ```json
 * // Response:
 * {
 *   "status": "ok",
 *   "timestamp": "2025-01-01T12:00:00.000Z",
 *   "uptime": 3600.5,
 *   "environment": "production"
 * }
 * ```
 *
 * @remarks
 * **Casos de uso:**
 * - Monitoreo de disponibilidad (uptime monitoring)
 * - Health checks de Kubernetes/Docker
 * - Load balancer health checks
 * - Verificación rápida del estado del servicio
 *
 * **Consideraciones:**
 * - Este endpoint NO requiere autenticación
 * - Siempre retorna 200 si el servidor responde
 * - Para checks más complejos (DB, Redis, etc.) crear endpoint /health/deep
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Exporta el router de health check
 * @exports router
 */
export default router;

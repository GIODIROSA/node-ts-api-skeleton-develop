/**
 * @fileoverview Sistema de trazabilidad de requests usando AsyncLocalStorage
 *
 * Este módulo proporciona un contexto asíncrono para rastrear requests a través
 * de toda la aplicación sin necesidad de pasar el traceId explícitamente en cada
 * función. Utiliza la API AsyncLocalStorage de Node.js para mantener el contexto
 * a través de operaciones asíncronas.
 *
 * @module config/trace-context
 *
 * @description
 * Características principales:
 * - Mantiene el traceId a través de operaciones asíncronas (Promises, callbacks, etc.)
 * - No requiere pasar el traceId como parámetro en cada función
 * - Integración automática con el sistema de logging
 * - Aislamiento de contexto entre diferentes requests concurrentes
 *
 * @example
 * ```typescript
 * import traceContext from './trace-context';
 *
 * // En un middleware de Express
 * app.use((req, res, next) => {
 *   const traceId = req.headers['x-trace-id'] || generateTraceId();
 *   traceContext.runWithTrace(traceId, () => {
 *     next();
 *   });
 * });
 *
 * // En cualquier parte de la aplicación
 * const currentTraceId = traceContext.getTraceId();
 * logger.info('Procesando request', currentTraceId);
 * ```
 *
 * @requires async_hooks - API nativa de Node.js para contexto asíncrono
 * @see {@link https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage}
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Estructura del almacenamiento de contexto de trazabilidad
 *
 * @interface TraceStore
 * @property {string} traceId - Identificador único del request para trazabilidad
 */
interface TraceStore {
  traceId: string;
}

/**
 * Instancia de AsyncLocalStorage para almacenar el contexto de trazabilidad
 *
 * Esta instancia mantiene el estado del traceId aislado entre diferentes
 * requests concurrentes, asegurando que cada request tenga su propio contexto
 * independiente sin interferencias.
 *
 * @constant
 * @type {AsyncLocalStorage<TraceStore>}
 */
const asyncLocalStorage = new AsyncLocalStorage<TraceStore>();

/**
 * Ejecuta una función dentro de un contexto de trazabilidad específico
 *
 * Crea un nuevo contexto asíncrono con el traceId proporcionado y ejecuta
 * la función dentro de ese contexto. Todas las operaciones asíncronas dentro
 * de la función tendrán acceso al mismo traceId.
 *
 * @template T - Tipo de retorno de la función
 * @param {string} traceId - Identificador único de trazabilidad del request
 * @param {() => T} fn - Función a ejecutar dentro del contexto
 * @returns {T} El resultado de ejecutar la función
 *
 * @example
 * ```typescript
 * // En un middleware de Express
 * app.use((req, res, next) => {
 *   const traceId = req.headers['x-trace-id'] || uuidv4();
 *   traceContext.runWithTrace(traceId, () => {
 *     next(); // Todo el código subsecuente tendrá acceso al traceId
 *   });
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Ejecutar una operación con trazabilidad
 * const result = traceContext.runWithTrace('abc-123', async () => {
 *   await processData();
 *   return 'completed';
 * });
 * ```
 */
const runWithTrace = <T>(traceId: string, fn: () => T): T => {
  return asyncLocalStorage.run({ traceId }, fn);
};

/**
 * Establece el ID de traza en el contexto actual si no existe uno previo
 *
 * Esta función intenta establecer un traceId en el contexto actual usando
 * `enterWith`. Solo establece el traceId si no existe un contexto previo.
 * Si ya existe un contexto, no lo modifica para mantener la integridad
 * del contexto original.
 *
 * **Nota:** Preferir usar `runWithTrace` para crear contextos nuevos, ya que
 * proporciona un mejor aislamiento y limpieza automática del contexto.
 *
 * @param {string} traceId - Identificador único de trazabilidad a establecer
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Establecer traceId si no existe
 * if (!traceContext.getTraceId()) {
 *   traceContext.setTraceId('xyz-789');
 * }
 * ```
 *
 * @see {@link runWithTrace} - Método preferido para crear contextos
 */
const setTraceId = (traceId: string): void => {
  // Si ya hay un store, no podemos modificarlo directamente
  // Pero podemos crear uno nuevo con el traceId
  if (!asyncLocalStorage.getStore()) {
    asyncLocalStorage.enterWith({ traceId });
  }
};

/**
 * Obtiene el ID de traza del contexto asíncrono actual
 *
 * Recupera el traceId del contexto actual si existe. Esta función puede
 * ser llamada desde cualquier parte del código que se ejecute dentro de
 * un contexto creado con `runWithTrace` o `setTraceId`.
 *
 * @returns {string | undefined} El traceId actual o undefined si no hay contexto
 *
 * @example
 * ```typescript
 * // En cualquier función dentro del contexto
 * async function processUser() {
 *   const traceId = traceContext.getTraceId();
 *   logger.info('Procesando usuario', traceId);
 *
 *   if (traceId) {
 *     // Usar el traceId para logging, headers, etc.
 *     await externalAPI.call({ headers: { 'X-Trace-ID': traceId } });
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Verificar si existe contexto de trazabilidad
 * const hasTrace = !!traceContext.getTraceId();
 * console.log(`Contexto de traza activo: ${hasTrace}`);
 * ```
 */
const getTraceId = (): string | undefined => {
  const store = asyncLocalStorage.getStore();
  return store ? store.traceId : undefined;
};

/**
 * Exportación por defecto del módulo de contexto de trazabilidad
 *
 * Proporciona las tres funciones principales para gestionar el contexto
 * de trazabilidad a través de la aplicación.
 *
 * @exports traceContext
 * @property {Function} runWithTrace - Ejecuta función con contexto de traza
 * @property {Function} setTraceId - Establece traceId en contexto actual
 * @property {Function} getTraceId - Obtiene traceId del contexto actual
 */
export default {
  runWithTrace,
  setTraceId,
  getTraceId,
};

/**
 * @fileoverview Punto de entrada principal del servidor HTTP
 *
 * Este archivo es responsable de:
 * - Inicializar y configurar el servidor HTTP
 * - Configurar manejadores de señales del sistema (SIGTERM, SIGINT)
 * - Implementar manejo global de errores no capturados
 * - Gestionar el ciclo de vida del servidor (inicio y cierre ordenado)
 *
 * @module server
 * @requires dotenv - Carga variables de entorno desde .env
 * @requires module-alias - Permite usar alias de rutas (@config, @v1, etc.)
 * @requires http - Módulo nativo de Node.js para crear servidor HTTP
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

// ==========================================
// CONFIGURACIÓN INICIAL
// ==========================================

// Cargar variables de entorno antes que cualquier otro módulo
import dotenv from 'dotenv';
dotenv.config();

// Registrar module-alias SOLO en producción (cuando se ejecuta desde dist/)
// En desarrollo, tsconfig-paths (en el comando npm run dev) maneja los alias
if (process.env.NODE_ENV === 'uat' || process.env.NODE_ENV === 'prd') {
  require('module-alias/register');
}

// ==========================================
// IMPORTACIONES
// ==========================================

import { ENV } from '@config/constants';
import { connectDatabase } from '@config/db';
import Logger from '@config/logger';
import * as childProcess from 'child_process';
import { createServer } from 'http';
import app from './app';

// ==========================================
// CONSTANTES Y CONFIGURACIÓN
// ==========================================

const { PORT, NODE_ENV } = ENV;

/**
 * Logger específico para el módulo del servidor
 * Permite rastrear logs relacionados con el ciclo de vida del servidor
 */
const logger = new Logger('server');

// ==========================================
// MANEJO DE ERRORES NO CAPTURADOS
// ==========================================

/**
 * Handler para errores síncronos no capturados (uncaughtException)
 *
 * Este evento se dispara cuando ocurre una excepción que no fue capturada
 * por ningún try-catch. Por defecto, Node.js imprimiría el stack trace y
 * terminaría el proceso.
 *
 * @event uncaughtException
 * @param {Error} error - El error que no fue capturado
 *
 * @example
 * // Este error sería capturado por este handler:
 * // throw new Error('Error no manejado');
 *
 * @see {@link https://nodejs.org/api/process.html#event-uncaughtexception}
 *
 * @remarks
 * - En producción, generalmente se recomienda cerrar el proceso después de loguear
 * - En desarrollo, mantenerlo vivo facilita el debugging
 * - El proceso puede estar en un estado inconsistente después de este error
 */
process.on('uncaughtException', (error: Error) => {
  logger.error(
    '❌ UNCAUGHT EXCEPTION - Error síncrono no capturado:',
    JSON.stringify({
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    })
  );
  console.error('❌ UNCAUGHT EXCEPTION:', error);

  // En producción normalmente querrías cerrar el proceso
  // pero para debugging lo mantenemos vivo
  // process.exit(1);
});

/**
 * Handler para promesas rechazadas sin manejador (unhandledRejection)
 *
 * Este evento se dispara cuando una Promise es rechazada y no tiene un
 * .catch() o segundo argumento en .then() para manejar el rechazo.
 *
 * @event unhandledRejection
 * @param {any} reason - La razón del rechazo (usualmente un Error)
 * @param {Promise<any>} _promise - La promesa que fue rechazada (no usado)
 *
 * @example
 * // Este error sería capturado por este handler:
 * // Promise.reject(new Error('Promesa rechazada'));
 * // async function test() { throw new Error('Error en async'); }
 * // test(); // Sin await ni .catch()
 *
 * @see {@link https://nodejs.org/api/process.html#event-unhandledrejection}
 *
 * @remarks
 * - Común en código asíncrono donde se olvida el await o .catch()
 * - El prefijo _ en _promise indica que es intencionalmente no usado
 */
process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
  logger.error(
    '❌ UNHANDLED REJECTION - Promise rechazada sin catch:',
    JSON.stringify({
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: new Date().toISOString(),
    })
  );
  console.error('❌ UNHANDLED REJECTION:', reason);

  // No cerrar el proceso, solo loguear para debugging
  // process.exit(1);
});

/**
 * Handler para señal SIGTERM (terminación ordenada)
 *
 * SIGTERM es una señal de terminación "amable" que permite al proceso
 * realizar limpieza antes de cerrarse. Comúnmente enviada por:
 * - Docker al detener un contenedor (docker stop)
 * - Kubernetes al escalar o actualizar pods
 * - Sistemas de orquestación en general
 *
 * @event SIGTERM
 *
 * @example
 * // Simular SIGTERM en desarrollo:
 * // process.kill(process.pid, 'SIGTERM');
 *
 * @see {@link https://nodejs.org/api/process.html#signal-events}
 *
 * @remarks
 * - Implementa graceful shutdown cerrando el servidor HTTP
 * - Permite que las conexiones activas terminen antes de cerrar
 * - Docker espera 10 segundos antes de enviar SIGKILL si no se cierra
 */
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recibido - Docker está deteniendo el contenedor');
  console.log('🛑 SIGTERM recibido');

  // Cerrar el servidor de forma ordenada
  if (httpServer) {
    httpServer.close(() => {
      logger.info('✅ Servidor cerrado correctamente');
    });
  }
});

/**
 * Handler para señal SIGINT (interrupción por usuario)
 *
 * SIGINT se envía cuando el usuario presiona Ctrl+C en la terminal.
 * Similar a SIGTERM, permite una terminación ordenada del proceso.
 *
 * @event SIGINT
 *
 * @example
 * // Usuario presiona Ctrl+C en la terminal
 * // O ejecuta: kill -INT <pid>
 *
 * @see {@link https://nodejs.org/api/process.html#signal-events}
 *
 * @remarks
 * - Común durante desarrollo cuando se detiene el servidor manualmente
 * - Implementa el mismo graceful shutdown que SIGTERM
 */
process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recibido - Usuario detuvo el proceso');
  console.log('🛑 SIGINT recibido');

  // Cerrar el servidor de forma ordenada
  if (httpServer) {
    httpServer.close(() => {
      logger.info('✅ Servidor cerrado correctamente');
    });
  }
});

/**
 * Handler para el evento de salida del proceso
 *
 * Este evento se dispara justo antes de que el proceso de Node.js termine.
 * Solo puede ejecutar código síncrono, no se permiten operaciones asíncronas.
 *
 * @event exit
 * @param {number} code - Código de salida del proceso
 *
 * @example
 * // Códigos de salida comunes:
 * // 0   = Salida exitosa
 * // 1   = Error general
 * // 2   = Uso incorrecto de comando
 * // 130 = Terminado por Ctrl+C (SIGINT)
 * // 137 = Terminado por SIGKILL (kill -9)
 * // 143 = Terminado por SIGTERM (kill -15)
 *
 * @see {@link https://nodejs.org/api/process.html#event-exit}
 *
 * @remarks
 * - Solo código síncrono es permitido aquí
 * - Útil para logging final y auditoría
 * - No se puede prevenir la salida del proceso en este punto
 */
process.on('exit', (code) => {
  const message = `🔚 Proceso terminando con código: ${code}`;
  logger.info(
    message +
      JSON.stringify({
        exitCode: code,
        timestamp: new Date().toISOString(),
      })
  );
  console.log(message);

  // Códigos de salida comunes:
  // 0 = Salida normal
  // 1 = Error general
  // 137 = SIGKILL (Docker mató el proceso por falta de recursos)
  // 143 = SIGTERM (Docker detuvo el contenedor normalmente)
});

/**
 * Handler para warnings emitidos por Node.js
 *
 * Node.js emite warnings para situaciones que no son errores pero que
 * merecen atención, como:
 * - Uso de APIs deprecadas
 * - Fugas de memoria potenciales (muchos listeners)
 * - Problemas de rendimiento
 *
 * @event warning
 * @param {Error} warning - Objeto de warning con name, message y stack
 *
 * @example
 * // Warnings comunes:
 * // - DeprecationWarning: API deprecada
 * // - MaxListenersExceededWarning: Demasiados event listeners
 * // - ExperimentalWarning: Uso de feature experimental
 *
 * @see {@link https://nodejs.org/api/process.html#event-warning}
 *
 * @remarks
 * - Los warnings no detienen la ejecución
 * - Útiles para detectar problemas antes de que se conviertan en errores
 */
process.on('warning', (warning) => {
  logger.warn(
    '⚠️  Node.js Warning:' +
      JSON.stringify({
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
        timestamp: new Date().toISOString(),
      })
  );
  console.warn('⚠️  Warning:', warning);
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================

/**
 * Instancia del servidor HTTP
 *
 * Se declara en el scope global para que los handlers de señales
 * (SIGTERM, SIGINT) puedan acceder a él y realizar un cierre ordenado.
 *
 * @type {import('http').Server | null}
 */
let httpServer: ReturnType<typeof createServer> | null = null;

/**
 * Inicializa la conexión a la base de datos
 *
 * Verifica que Prisma pueda conectarse a la base de datos y
 * opcionalmente ejecuta el seed si está configurado.
 *
 * @async
 * @function initializeDatabase
 * @throws {Error} Si no se puede conectar a la base de datos
 *
 * @remarks
 * - Ejecuta un query simple para verificar la conexión
 * - Si RUN_SEED=true, ejecuta el script de seed
 * - El seed solo se ejecuta en desarrollo
 */
const initializeDatabase = async () => {
  try {
    logger.info('🔌 Conectando a la base de datos...');

    // Conectar a la base de datos
    await connectDatabase();

    // Ejecutar seed si está configurado
    const runSeed = process.env.RUN_SEED === 'true';
    if (runSeed && NODE_ENV !== 'production') {
      logger.info('🌱 Ejecutando seed de base de datos...');
      try {
        childProcess.execSync('node prisma/seed.js', { stdio: 'inherit' });
        logger.info('✅ Seed ejecutado correctamente');
      } catch (seedError) {
        logger.warn(
          '⚠️  Error ejecutando seed (puede ser normal si ya existen datos)'
        );
      }
    }
  } catch (error) {
    logger.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};

/**
 * Inicializa y arranca el servidor HTTP
 *
 * Esta función es el punto de entrada principal para iniciar el servidor.
 * Configura el servidor HTTP basado en Express y maneja los errores de inicio.
 *
 * @async
 * @function startServer
 * @throws {Error} Si el puerto está en uso (EADDRINUSE)
 * @throws {Error} Si no hay permisos para el puerto (EACCES)
 * @throws {Error} Cualquier otro error durante la inicialización
 *
 * @example
 * // Iniciar el servidor
 * try {
 *   await startServer();
 * } catch (error) {
 *   console.error('Error al iniciar:', error);
 * }
 *
 * @remarks
 * Flujo de inicialización:
 * 1. Inicializar conexión a base de datos
 * 2. Crear servidor HTTP a partir de la aplicación Express
 * 3. Configurar el puerto de escucha
 * 4. Registrar handlers para errores del servidor
 * 5. Loguear el estado de inicialización
 *
 * @see {@link https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener}
 */
const startServer = async () => {
  try {
    logger.info('🚀 Iniciando servidor...');

    // 1. Inicializar base de datos
    await initializeDatabase();

    // 2. Crear servidor HTTP
    httpServer = createServer(app);

    // 3. Iniciar el servidor HTTP
    httpServer.listen(PORT, () => {
      logger.debug(`Ambiente: ${NODE_ENV}`);
      logger.info(`Servidor HTTP iniciado en el puerto ${PORT}`);
      logger.info('✅ Sistema completamente inicializado y listo');
    });

    // Manejar errores del servidor HTTP
    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ El puerto ${PORT} ya está en uso`);
        throw new Error(`Port ${PORT} is already in use`);
      } else if (error.code === 'EACCES') {
        logger.error(`❌ No hay permisos para usar el puerto ${PORT}`);
        throw new Error(`Permission denied for port ${PORT}`);
      } else {
        logger.error('❌ Error en el servidor HTTP:', error);
        throw error;
      }
    });
  } catch (error) {
    logger.error('❌ Error crítico al iniciar el servidor:', error);
    console.error('❌ Error crítico:', error);
    throw error;
  }
};

// ==========================================
// EJECUCIÓN PRINCIPAL
// ==========================================

/**
 * Bloque de ejecución principal
 *
 * Inicia el servidor y maneja cualquier error fatal que pueda ocurrir
 * durante el proceso de inicialización.
 *
 * @remarks
 * Los errores aquí capturados son críticos y generalmente indican:
 * - Fallo de conexión a base de datos
 * - Puerto ya en uso
 * - Falta de permisos
 * - Configuración inválida
 * - Dependencias faltantes
 *
 * En estos casos, el error se propaga para que el proceso termine,
 * ya que no tiene sentido mantener el servidor corriendo en un estado inválido.
 */
// Iniciar el servidor
void (async () => {
  try {
    await startServer();
  } catch (error) {
    logger.error('❌ Error fatal en startServer:', error);
    console.error('❌ Error fatal:', error);
    throw error;
  }
})();

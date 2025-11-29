/**
 * @fileoverview Sistema de logging centralizado basado en Winston
 *
 * Este módulo proporciona una clase Logger que implementa un sistema de logging
 * con las siguientes características:
 * - Rotación diaria de archivos de log
 * - Formato tipo log4j con contexto y trazabilidad
 * - Manejo centralizado de excepciones y rechazos de promesas
 * - Soporte para múltiples instancias por contexto
 * - Métodos estáticos para uso directo sin instanciación
 *
 * @module config/logger
 */

import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { ENV } from './constants';
import traceContext from './trace-context';
const { LOG_PATH, LOG_NAME, LOG_LEVEL } = ENV;

/**
 * Mapa de instancias de logger indexadas por nombre de contexto
 */
interface LoggerInstance {
  [key: string]: Logger;
}

/**
 * Estructura de información de un log
 */
interface LogInfo {
  /** Nivel del log (info, debug, warn, error, verbose, silly) */
  level: string;
  /** Mensaje a registrar (puede ser string, objeto o Error) */
  message: unknown;
  /** ID de trazabilidad opcional para seguimiento de requests */
  traceId?: string;
  /** Propiedades adicionales del log */
  [key: string]: unknown;
}

/**
 * Almacena instancias de logger por contexto para implementar patrón singleton
 * Evita crear múltiples loggers para el mismo contexto
 */
const loggerInstances: LoggerInstance = {};

/**
 * Transport para registrar excepciones no capturadas
 * Los archivos rotan diariamente y se mantienen por 14 días
 */
const exceptionRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(LOG_PATH, 'exception-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

/**
 * Transport para registrar rechazos de promesas no manejados
 * Los archivos rotan diariamente y se mantienen por 14 días
 */
const rejectionRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(LOG_PATH, 'rejections-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
});

/**
 * Configurar manejadores globales para excepciones y rechazos
 * Solo se registran una vez a nivel de aplicación para evitar duplicados
 */
winston.exceptions.handle(exceptionRotateTransport);
winston.rejections.handle(rejectionRotateTransport);

/**
 * Clase Logger para gestión centralizada de logs
 *
 * Implementa un sistema de logging con:
 * - Patrón singleton por contexto
 * - Formato log4j personalizado
 * - Rotación automática de archivos
 * - Trazabilidad mediante traceId
 * - Métodos estáticos para uso directo
 *
 * @example
 * // Uso con instancia específica
 * const logger = Logger.getLogger('MiModulo');
 * logger.info('Mensaje de información');
 *
 * @example
 * // Uso con métodos estáticos
 * Logger.info('Mensaje directo');
 * Logger.error('Error', { stack: error.stack });
 */
class Logger {
  /** Nombre del contexto o módulo que usa este logger */
  private instanceName!: string;
  /** Instancia de winston logger */
  private logger!: winston.Logger;
  /** Transport para rotación de archivos */
  private fileRotateTransport!: winston.transport;

  /**
   * Registra un mensaje de nivel INFO
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param traceId - ID de trazabilidad opcional
   */
  static info: (message: unknown, traceId?: string) => void;

  /**
   * Registra un mensaje de nivel DEBUG
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param traceId - ID de trazabilidad opcional
   */
  static debug: (message: unknown, traceId?: string) => void;

  /**
   * Registra un mensaje de nivel WARN
   * @param message - Mensaje a registrar (string, objeto o Error)
   */
  static warn: (message: unknown) => void;

  /**
   * Registra un mensaje de nivel ERROR
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param metadata - Metadatos adicionales (stack trace, contexto, etc.)
   */
  static error: (message: unknown, metadata?: unknown) => void;

  /**
   * Registra un mensaje de nivel VERBOSE
   * @param message - Mensaje a registrar (string, objeto o Error)
   */
  static verbose: (message: unknown) => void;

  /**
   * Registra un mensaje de nivel SILLY (más detallado)
   * @param message - Mensaje a registrar (string, objeto o Error)
   */
  static silly: (message: unknown) => void;

  /**
   * Obtiene o crea una instancia de logger para un contexto específico
   * Implementa patrón singleton: retorna la misma instancia para el mismo contexto
   *
   * @param instanceName - Nombre del contexto (ej: 'AuthService', 'UserController')
   * @returns Instancia de Logger para el contexto especificado
   *
   * @example
   * const logger = Logger.getLogger('AuthService');
   * logger.info('Usuario autenticado');
   */
  static getLogger(instanceName: string): Logger {
    if (loggerInstances[instanceName]) {
      return loggerInstances[instanceName];
    }
    return new Logger(instanceName);
  }

  /**
   * Constructor de la clase Logger
   *
   * Crea una nueva instancia de logger o retorna una existente si ya fue creada
   * para el mismo contexto. Configura:
   * - Rotación diaria de archivos
   * - Formato log4j personalizado
   * - Transports para consola y archivo
   *
   * @param instanceName - Nombre del contexto o módulo
   *
   * @private No usar directamente, usar Logger.getLogger() en su lugar
   */
  constructor(instanceName: string) {
    // Si ya existe una instancia para este contexto, usar esa instancia
    // en lugar de crear una nueva
    if (loggerInstances[instanceName]) {
      const existingLogger = loggerInstances[instanceName];
      this.instanceName = existingLogger.instanceName;
      this.logger = existingLogger.logger;
      this.fileRotateTransport = existingLogger.fileRotateTransport;
      return;
    }

    // Si no existe, crea una nueva instancia para este contexto
    this.instanceName = instanceName;

    // Archivo rotativo para logs normales
    this.fileRotateTransport = new winston.transports.DailyRotateFile({
      filename: `${LOG_PATH}/logger-${LOG_NAME}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    });

    // Formato tipo log4j que usa el nombre del contexto
    const log4jFormat = winston.format.printf((info: LogInfo) => {
      const { timestamp, level, message, traceId, stack } = info;
      // Format log4j: timestamp [level] [nodeId] [context] [traceId] message
      const upperLevel = level.toUpperCase().padEnd(5);

      // Handle message formatting properly
      let formattedMessage: string;
      if (typeof message === 'string') {
        formattedMessage = message;
      } else {
        try {
          formattedMessage = JSON.stringify(message);
        } catch (e) {
          formattedMessage = String(message);
        }
      }

      const stackTrace = typeof stack === 'string' ? `\n${stack}` : '';
      const timestampStr = String(timestamp || '');
      const traceIdStr = String(traceId || '-');

      return `[${timestampStr}] [${upperLevel.trim()}] [${this.instanceName.trim()}] [${traceIdStr}] ${formattedMessage}${stackTrace}`;
    });

    this.logger = winston.createLogger({
      level: LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        log4jFormat
      ),
      defaultMeta: { service: this.instanceName },
      transports: [
        this.fileRotateTransport,
        new winston.transports.Console({ format: log4jFormat }),
      ],
      // No se incluyen exceptionHandlers ni rejectionHandlers aquí
      // ya que están configurados a nivel global para evitar duplicados
    });

    // Guardar esta instancia en el mapa de loggers por contexto
    loggerInstances[this.instanceName] = this;
  }

  /**
   * Método base para registrar logs en cualquier nivel
   *
   * Convierte el mensaje a string y lo registra con el nivel especificado.
   * Obtiene automáticamente el traceId del contexto si no se proporciona.
   *
   * @param level - Nivel del log (info, debug, warn, error, verbose, silly)
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param traceId - ID de trazabilidad opcional
   *
   * @private Usar los métodos específicos (info, debug, etc.) en su lugar
   */
  log(level: string, message: unknown, traceId?: string): void {
    // Obtiene el traceId automáticamente si no se pasa
    const id = traceId || traceContext.getTraceId() || '-';

    // Convert message to string for winston
    let messageStr: string;
    if (typeof message === 'string') {
      messageStr = message;
    } else if (message instanceof Error) {
      messageStr = message.message;
    } else {
      try {
        messageStr = JSON.stringify(message);
      } catch (e) {
        messageStr = String(message);
      }
    }

    this.logger.log(level, messageStr, {
      traceId: id,
      appName: this.instanceName, // Incluir el nombre del contexto en cada mensaje
    });
  }

  /**
   * Registra un mensaje de nivel INFO
   * Usado para información general del flujo de la aplicación
   *
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param traceId - ID de trazabilidad opcional para seguimiento de requests
   *
   * @example
   * logger.info('Usuario creado exitosamente');
   * logger.info({ userId: 123, action: 'create' });
   */
  info(message: unknown, traceId?: string): void {
    this.log('info', message, traceId);
  }

  /**
   * Registra un mensaje de nivel DEBUG
   * Usado para información detallada útil durante el desarrollo
   *
   * @param message - Mensaje a registrar (string, objeto o Error)
   * @param traceId - ID de trazabilidad opcional para seguimiento de requests
   *
   * @example
   * logger.debug('Parámetros de entrada', { params: req.params });
   */
  debug(message: unknown, traceId?: string): void {
    this.log('debug', message, traceId);
  }

  /**
   * Registra un mensaje de nivel WARN
   * Usado para advertencias que no son errores pero requieren atención
   *
   * @param message - Mensaje a registrar (string, objeto o Error)
   *
   * @example
   * logger.warn('Uso de API deprecada');
   */
  warn(message: unknown): void {
    this.log('warn', message);
  }

  /**
   * Registra un mensaje de nivel ERROR
   * Usado para errores que afectan la funcionalidad
   *
   * @param message - Mensaje de error (string, objeto o Error)
   * @param metadata - Metadatos adicionales como stack trace, contexto, etc.
   *
   * @example
   * logger.error('Error al conectar a la base de datos');
   * logger.error(error.message, { stack: error.stack, userId: 123 });
   */
  error(message: unknown, metadata?: unknown): void {
    // Convert message to string
    let messageStr: string;
    if (typeof message === 'string') {
      messageStr = message;
    } else if (message instanceof Error) {
      messageStr = message.message;
    } else {
      try {
        messageStr = JSON.stringify(message);
      } catch (e) {
        messageStr = String(message);
      }
    }

    // If metadata is provided, include it in the log
    if (metadata && typeof metadata === 'object' && metadata !== null) {
      const metadataObj = metadata as Record<string, unknown>;
      const traceId =
        (metadataObj.traceId as string | undefined) ||
        traceContext.getTraceId() ||
        '-';

      this.logger.log('error', messageStr, {
        ...metadataObj,
        traceId,
        appName: this.instanceName,
      });
    } else {
      this.log('error', message);
    }
  }

  /**
   * Registra un mensaje de nivel VERBOSE
   * Usado para información muy detallada, más que DEBUG
   *
   * @param message - Mensaje a registrar (string, objeto o Error)
   *
   * @example
   * logger.verbose('Detalles completos de la petición HTTP');
   */
  verbose(message: unknown): void {
    this.log('verbose', message);
  }

  /**
   * Registra un mensaje de nivel SILLY
   * El nivel más detallado, usado para debugging muy específico
   *
   * @param message - Mensaje a registrar (string, objeto o Error)
   *
   * @example
   * logger.silly('Cada iteración del loop');
   */
  silly(message: unknown): void {
    this.log('silly', message);
  }

  /**
   * Cambia el nombre del contexto (archivo/módulo) para los logs
   * @param contextName - Nombre del contexto (archivo/módulo)
   */
  setContext(contextName: string): void {
    this.instanceName = contextName;
  }
}

/**
 * Instancia de logger por defecto para uso de métodos estáticos
 * Usa el contexto 'app' para logs generales de la aplicación
 */
const defaultLogger = new Logger('app');

/**
 * Implementación de métodos estáticos de Logger
 * Permiten usar el logger sin crear una instancia explícita
 * Todos los logs se registran bajo el contexto 'app'
 */
Logger.info = (message: unknown, traceId?: string): void => {
  defaultLogger.info(message, traceId);
};

Logger.debug = (message: unknown, traceId?: string): void => {
  defaultLogger.debug(message, traceId);
};

Logger.warn = (message: unknown): void => {
  defaultLogger.warn(message);
};

Logger.error = (message: unknown, metadata?: unknown): void => {
  defaultLogger.error(message, metadata);
};

Logger.verbose = (message: unknown): void => {
  defaultLogger.verbose(message);
};

Logger.silly = (message: unknown): void => {
  defaultLogger.silly(message);
};

export default Logger;

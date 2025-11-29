/**
 * @fileoverview Mensajes de validación estandarizados
 *
 * Define todos los mensajes de error de validación utilizados en la aplicación.
 * Centraliza los mensajes para mantener consistencia y facilitar traducción.
 *
 * @module v1/constants/validation-messages
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

/**
 * Mensajes de validación estandarizados
 *
 * Objeto inmutable que contiene todos los mensajes de error de validación.
 * Algunos mensajes son funciones que generan mensajes dinámicos.
 *
 * @constant {Object} ValidationMessages
 * @readonly
 *
 * @example
 * ```typescript
 * import { ValidationMessages } from '@constants/validation-messages';
 *
 * // Mensaje estático
 * const error1 = ValidationMessages.INVALID_EMAIL;
 * // "El email no tiene un formato válido"
 *
 * // Mensaje dinámico
 * const error2 = ValidationMessages.FIELD_REQUIRED('nombre');
 * // "El campo nombre es requerido"
 *
 * const error3 = ValidationMessages.MIN_LENGTH('password', 8);
 * // "El campo password debe tener al menos 8 caracteres"
 * ```
 *
 * @remarks
 * **Categorías de mensajes:**
 * - UUID: Validaciones de identificadores
 * - Campos: Requeridos y vacíos
 * - Longitud: Mínimo, máximo y rangos
 * - Formato: Email, URL, fecha
 * - Tipo: String, number, boolean, array
 * - Rango: Valores numéricos
 * - Enum: Valores permitidos
 *
 * **Uso en validadores:**
 * ```typescript
 * body('email')
 *   .notEmpty()
 *   .withMessage(ValidationMessages.FIELD_REQUIRED('email'))
 *   .isEmail()
 *   .withMessage(ValidationMessages.INVALID_EMAIL);
 * ```
 */
export const ValidationMessages = {
  /**
   * Validaciones de UUID
   * Mensajes para identificadores únicos
   */
  /** Mensaje cuando falta el ID */
  ID_REQUIRED: 'El ID es requerido',
  /** Mensaje cuando el UUID no es válido */
  INVALID_UUID: 'El ID debe ser un UUID válido',

  /**
   * Validaciones de datos generales
   */
  /** Mensaje genérico para datos inválidos */
  INVALID_DATA: 'Datos de entrada inválidos',

  /**
   * Validaciones de campos requeridos
   * Funciones que generan mensajes dinámicos
   */
  /**
   * Genera mensaje para campo requerido
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  FIELD_REQUIRED: (field: string) => `El campo ${field} es requerido`,
  /**
   * Genera mensaje para campo vacío
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  FIELD_EMPTY: (field: string) => `El campo ${field} no puede estar vacío`,

  /**
   * Validaciones de longitud
   * Funciones para validar tamaño de strings
   */
  /**
   * Genera mensaje para longitud mínima
   * @param {string} field - Nombre del campo
   * @param {number} min - Longitud mínima requerida
   * @returns {string} Mensaje de error
   */
  MIN_LENGTH: (field: string, min: number) =>
    `El campo ${field} debe tener al menos ${min} caracteres`,
  /**
   * Genera mensaje para longitud máxima
   * @param {string} field - Nombre del campo
   * @param {number} max - Longitud máxima permitida
   * @returns {string} Mensaje de error
   */
  MAX_LENGTH: (field: string, max: number) =>
    `El campo ${field} no puede exceder ${max} caracteres`,
  /**
   * Genera mensaje para rango de longitud
   * @param {string} field - Nombre del campo
   * @param {number} min - Longitud mínima
   * @param {number} max - Longitud máxima
   * @returns {string} Mensaje de error
   */
  LENGTH_RANGE: (field: string, min: number, max: number) =>
    `El campo ${field} debe tener entre ${min} y ${max} caracteres`,

  /**
   * Validaciones de formato
   * Mensajes para formatos específicos
   */
  /** Mensaje para email inválido */
  INVALID_EMAIL: 'El email no tiene un formato válido',
  /** Mensaje para URL inválida */
  INVALID_URL: 'La URL no tiene un formato válido',
  /** Mensaje para fecha inválida */
  INVALID_DATE: 'La fecha no tiene un formato válido',

  /**
   * Validaciones de tipo de dato
   * Funciones para validar tipos
   */
  /**
   * Genera mensaje para tipo string
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  MUST_BE_STRING: (field: string) => `El campo ${field} debe ser texto`,
  /**
   * Genera mensaje para tipo number
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  MUST_BE_NUMBER: (field: string) => `El campo ${field} debe ser un número`,
  /**
   * Genera mensaje para tipo boolean
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  MUST_BE_BOOLEAN: (field: string) =>
    `El campo ${field} debe ser verdadero o falso`,
  /**
   * Genera mensaje para tipo array
   * @param {string} field - Nombre del campo
   * @returns {string} Mensaje de error
   */
  MUST_BE_ARRAY: (field: string) => `El campo ${field} debe ser un arreglo`,

  /**
   * Validaciones de rango numérico
   * Funciones para validar valores numéricos
   */
  /**
   * Genera mensaje para valor mínimo
   * @param {string} field - Nombre del campo
   * @param {number} min - Valor mínimo permitido
   * @returns {string} Mensaje de error
   */
  MIN_VALUE: (field: string, min: number) =>
    `El campo ${field} debe ser mayor o igual a ${min}`,
  /**
   * Genera mensaje para valor máximo
   * @param {string} field - Nombre del campo
   * @param {number} max - Valor máximo permitido
   * @returns {string} Mensaje de error
   */
  MAX_VALUE: (field: string, max: number) =>
    `El campo ${field} debe ser menor o igual a ${max}`,
  /**
   * Genera mensaje para rango de valores
   * @param {string} field - Nombre del campo
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @returns {string} Mensaje de error
   */
  VALUE_RANGE: (field: string, min: number, max: number) =>
    `El campo ${field} debe estar entre ${min} y ${max}`,

  /**
   * Validaciones de enumeraciones
   * Funciones para validar valores permitidos
   */
  /**
   * Genera mensaje para enum inválido
   * @param {string} field - Nombre del campo
   * @param {string[]} values - Valores permitidos
   * @returns {string} Mensaje de error
   */
  INVALID_ENUM: (field: string, values: string[]) =>
    `El campo ${field} debe ser uno de: ${values.join(', ')}`,

  /**
   * Validaciones de solicitud
   * Mensajes generales de procesamiento
   */
  /** Mensaje genérico para errores de procesamiento */
  REQUEST_PROCESSING: 'Error al procesar la solicitud',
} as const;

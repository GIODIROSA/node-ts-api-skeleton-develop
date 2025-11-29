/**
 * @fileoverview Validadores comunes reutilizables
 *
 * Define validaciones que pueden ser reutilizadas en diferentes módulos
 * de la aplicación para mantener consistencia y evitar duplicación.
 *
 * @module v1/validators/commons.validator
 * @requires express-validator - Middleware de validación
 * @requires @constants/validation-messages - Mensajes estandarizados
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { ValidationMessages } from '@constants/validation-messages';
import { param, ValidationChain } from 'express-validator';

/**
 * Validador para parámetro ID (UUID) en la URL
 *
 * Valida que el parámetro 'id' en la URL sea un UUID válido.
 * Útil para endpoints que reciben IDs de recursos.
 *
 * @constant {ValidationChain[]} uuidValidator
 *
 * @example
 * ```typescript
 * import { uuidValidator } from '@validators/commons.validator';
 *
 * router.get('/:id', uuidValidator, validate, controller.getById);
 * router.put('/:id', uuidValidator, validate, controller.update);
 * router.delete('/:id', uuidValidator, validate, controller.delete);
 * ```
 *
 * @remarks
 * - Valida formato UUID v4
 * - Retorna error 400 si el formato es inválido
 * - Previene inyecciones y formatos incorrectos
 */
export const uuidValidator: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage(ValidationMessages.ID_REQUIRED)
    .isUUID()
    .withMessage(ValidationMessages.INVALID_UUID),
];

/**
 * Validador para parámetro email en la URL
 *
 * Valida que el parámetro 'email' en la URL tenga un formato válido.
 * Útil para endpoints que buscan recursos por email.
 *
 * @constant {ValidationChain[]} emailParamValidator
 *
 * @example
 * ```typescript
 * import { emailParamValidator } from '@validators/commons.validator';
 *
 * router.get('/email/:email', emailParamValidator, validate, controller.getByEmail);
 * ```
 *
 * @remarks
 * - Valida formato de email estándar
 * - Normaliza el email (lowercase, trim)
 * - Retorna error 400 si el formato es inválido
 */
export const emailParamValidator: ValidationChain[] = [
  param('email')
    .trim()
    .notEmpty()
    .withMessage(ValidationMessages.FIELD_REQUIRED('email'))
    .isEmail()
    .withMessage(ValidationMessages.INVALID_EMAIL)
    .normalizeEmail(),
];

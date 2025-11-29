/**
 * @fileoverview Validadores para el módulo de usuarios
 *
 * Define las reglas de validación para las operaciones CRUD de usuarios
 * usando express-validator.
 *
 * @module v1/validators/user.validator
 * @requires express-validator - Middleware de validación
 * @requires @constants/validation-messages - Mensajes estandarizados
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { ValidationMessages } from '@constants/validation-messages';
import { body, ValidationChain } from 'express-validator';
import { emailParamValidator, uuidValidator } from './commons.validator';

/**
 * Validaciones para la creación de usuarios
 *
 * Valida que los datos necesarios para crear un usuario sean correctos:
 * - Email: requerido, formato válido, normalizado
 * - Name: requerido, longitud entre 2 y 100 caracteres
 *
 * @constant {ValidationChain[]} createUserValidation
 *
 * @example
 * ```typescript
 * router.post('/', createUserValidation, validate, userController.createUser);
 * ```
 *
 * @remarks
 * Si necesitas validar contraseñas, primero debes agregar el campo password
 * al modelo User en schema.prisma y ejecutar la migración.
 */
export const createUserValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(ValidationMessages.FIELD_REQUIRED('email'))
    .isEmail()
    .withMessage(ValidationMessages.INVALID_EMAIL)
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage(ValidationMessages.MAX_LENGTH('email', 255)),

  body('name')
    .trim()
    .notEmpty()
    .withMessage(ValidationMessages.FIELD_REQUIRED('name'))
    .isLength({ min: 2, max: 100 })
    .withMessage(ValidationMessages.LENGTH_RANGE('name', 2, 100)),
];

/**
 * Validaciones para actualizar un usuario
 *
 * Todos los campos son opcionales para permitir actualizaciones parciales:
 * - Email: opcional, formato válido si se proporciona
 * - Name: opcional, longitud entre 2 y 100 caracteres si se proporciona
 *
 * @constant {ValidationChain[]} updateUserValidation
 *
 * @example
 * ```typescript
 * router.put('/:id', updateUserValidation, validate, userController.updateUser);
 * ```
 *
 * @remarks
 * Si necesitas validar actualizaciones de contraseña, primero debes agregar
 * el campo password al modelo User en schema.prisma.
 */
export const updateUserValidation: ValidationChain[] = [
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(ValidationMessages.FIELD_EMPTY('email'))
    .isEmail()
    .withMessage(ValidationMessages.INVALID_EMAIL)
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage(ValidationMessages.MAX_LENGTH('email', 255)),

  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage(ValidationMessages.FIELD_EMPTY('name'))
    .isLength({ min: 2, max: 100 })
    .withMessage(ValidationMessages.LENGTH_RANGE('name', 2, 100)),
];

/**
 * Validación para parámetro ID (UUID)
 *
 * Reutiliza el validador común de UUID.
 *
 * @constant {ValidationChain[]} userIdValidation
 *
 * @example
 * ```typescript
 * router.get('/:id', userIdValidation, validate, userController.getUserById);
 * ```
 *
 * @see {@link uuidValidator} - Validador común reutilizable
 */
export const userIdValidation = uuidValidator;

/**
 * Validación para parámetro email en URL
 *
 * Reutiliza el validador común de email en parámetros.
 *
 * @constant {ValidationChain[]} emailParamValidation
 *
 * @example
 * ```typescript
 * router.get('/email/:email', emailParamValidation, validate, userController.getUserByEmail);
 * ```
 *
 * @see {@link emailParamValidator} - Validador común reutilizable
 */
export const emailParamValidation = emailParamValidator;

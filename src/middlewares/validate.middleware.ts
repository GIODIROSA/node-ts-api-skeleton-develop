/**
 * @fileoverview Middleware para procesar resultados de validación
 *
 * Procesa los resultados de express-validator y retorna errores
 * de validación en un formato consistente.
 *
 * @module middlewares/validate.middleware
 * @requires express-validator - Validación de datos
 * @requires @config/custom-error - Errores personalizados
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { BadRequestError } from '@config/custom-error';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware para validar los resultados de express-validator
 *
 * Verifica si hay errores de validación y los formatea en una respuesta
 * consistente. Si hay errores, lanza un BadRequestError con los detalles.
 *
 * @function validate
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {NextFunction} next - Función next
 * @throws {BadRequestError} Si hay errores de validación
 *
 * @example
 * ```typescript
 * import { validate } from '@middlewares/validate.middleware';
 * import { createUserValidation } from '@validators/user.validator';
 *
 * router.post('/', createUserValidation, validate, userController.createUser);
 * ```
 *
 * @remarks
 * **Formato de error:**
 * ```json
 * {
 *   "success": false,
 *   "message": "Errores de validación",
 *   "errors": [
 *     {
 *       "field": "email",
 *       "message": "El email no tiene un formato válido"
 *     }
 *   ]
 * }
 * ```
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    const error = new BadRequestError('Errores de validación');
    // Adjuntar los errores de validación al objeto error
    (error as any).validationErrors = formattedErrors;
    throw error;
  }

  next();
};

export default validate;

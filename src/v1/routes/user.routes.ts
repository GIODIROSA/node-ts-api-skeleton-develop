/**
 * @fileoverview Rutas de usuarios
 *
 * Define todos los endpoints HTTP para operaciones CRUD de usuarios.
 * Conecta las rutas con los métodos del controlador correspondiente.
 *
 * @module v1/routes/user.routes
 * @requires @controllers/user.controller - Controlador de usuarios
 * @requires express - Framework web
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { userController } from '@controllers/user.controller';
import { validate } from '@middlewares/validate.middleware';
import {
  createUserValidation,
  emailParamValidation,
  updateUserValidation,
  userIdValidation,
} from '@validators/user.validator';
import { Router } from 'express';

/**
 * Router de Express para usuarios
 */
const router = Router();

/**
 * @route POST /api/users
 * @description Crea un nuevo usuario
 * @access Público (agregar autenticación si es necesario)
 * @body {CreateUserDTO} - Datos del usuario a crear
 * @returns {UserDTO} 201 - Usuario creado exitosamente
 * @returns {Error} 400 - Datos inválidos
 * @returns {Error} 409 - Email ya existe
 * @returns {Error} 500 - Error del servidor
 */
router.post('/', createUserValidation, validate, userController.createUser);

/**
 * @route GET /api/users
 * @description Obtiene todos los usuarios
 * @access Público (agregar autenticación si es necesario)
 * @returns {UserDTO[]} 200 - Lista de usuarios
 * @returns {Error} 500 - Error del servidor
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @description Obtiene un usuario por su ID
 * @access Público (agregar autenticación si es necesario)
 * @param {string} id - ID del usuario (UUID)
 * @returns {UserDTO} 200 - Usuario encontrado
 * @returns {Error} 404 - Usuario no encontrado
 * @returns {Error} 500 - Error del servidor
 */
router.get('/:id', userIdValidation, validate, userController.getUserById);

/**
 * @route GET /api/users/email/:email
 * @description Obtiene un usuario por su email
 * @access Público (agregar autenticación si es necesario)
 * @param {string} email - Email del usuario
 * @returns {UserDTO} 200 - Usuario encontrado
 * @returns {Error} 404 - Usuario no encontrado
 * @returns {Error} 500 - Error del servidor
 */
router.get(
  '/email/:email',
  emailParamValidation,
  validate,
  userController.getUserByEmail
);

/**
 * @route PUT /api/users/:id
 * @description Actualiza un usuario existente
 * @access Público (agregar autenticación si es necesario)
 * @param {string} id - ID del usuario (UUID)
 * @body {UpdateUserDTO} - Datos a actualizar
 * @returns {UserDTO} 200 - Usuario actualizado
 * @returns {Error} 404 - Usuario no encontrado
 * @returns {Error} 400 - Datos inválidos
 * @returns {Error} 500 - Error del servidor
 */
router.put(
  '/:id',
  userIdValidation,
  updateUserValidation,
  validate,
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @description Elimina un usuario
 * @access Público (agregar autenticación si es necesario)
 * @param {string} id - ID del usuario (UUID)
 * @returns {Object} 200 - Confirmación de eliminación
 * @returns {Error} 404 - Usuario no encontrado
 * @returns {Error} 500 - Error del servidor
 */
router.delete('/:id', userIdValidation, validate, userController.deleteUser);

export default router;

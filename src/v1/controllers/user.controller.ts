/**
 * @fileoverview Controlador de usuarios
 *
 * Maneja las peticiones HTTP relacionadas con usuarios.
 * Valida datos de entrada, llama al servicio correspondiente y
 * formatea las respuestas HTTP.
 *
 * @module v1/controllers/user.controller
 * @requires @services/user.service - Servicio de lógica de negocio
 * @requires @interfaces/user/user.types - DTOs de usuario
 * @requires express - Framework web
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { CreateUserDTO, UpdateUserDTO } from '@interfaces/user/user.types';
import { userService } from '@services/user.service';
import { Request, Response } from 'express';

/**
 * Controlador de usuarios
 *
 * Maneja todas las operaciones HTTP relacionadas con usuarios.
 * Implementa el patrón MVC actuando como intermediario entre
 * las rutas y la lógica de negocio.
 *
 * @class UserController
 */
class UserController {
  /**
   * Crea un nuevo usuario
   *
   * Endpoint: POST /api/users
   *
   * @method createUser
   * @param {Request} req - Request de Express con CreateUserDTO en body
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Usuario creado con status 201
   *
   * @example
   * ```typescript
   * // Request body:
   * {
   *   "email": "user@example.com",
   *   "name": "John Doe",
   *   "password": "securePassword123"
   * }
   *
   * // Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "email": "user@example.com",
   *     "name": "John Doe",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "Usuario creado exitosamente"
   * }
   * ```
   *
   * @remarks
   * - El email debe ser único
   * - Validaciones deben aplicarse antes de este método
   * - Si necesitas autenticación, agrega el campo password al schema.prisma
   */
  createUser = async (req: Request, res: Response): Promise<Response> => {
    const userData: CreateUserDTO = req.body;
    const newUser = await userService.createUser(userData);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente',
    });
  };

  /**
   * Obtiene todos los usuarios
   *
   * Endpoint: GET /api/users
   *
   * @method getAllUsers
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Lista de usuarios con status 200
   *
   * @example
   * ```typescript
   * // Response:
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": "123e4567-e89b-12d3-a456-426614174000",
   *       "email": "user@example.com",
   *       "name": "John Doe",
   *       "createdAt": "2024-01-01T00:00:00.000Z",
   *       "updatedAt": "2024-01-01T00:00:00.000Z"
   *     }
   *   ],
   *   "message": "Usuarios obtenidos exitosamente"
   * }
   * ```
   */
  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      data: users,
      message: 'Usuarios obtenidos exitosamente',
    });
  };

  /**
   * Obtiene un usuario por ID
   *
   * Endpoint: GET /api/users/:id
   *
   * @method getUserById
   * @param {Request} req - Request de Express con id en params
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Usuario encontrado con status 200
   *
   * @example
   * ```typescript
   * // Request: GET /api/users/123e4567-e89b-12d3-a456-426614174000
   *
   * // Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "email": "user@example.com",
   *     "name": "John Doe",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "Usuario obtenido exitosamente"
   * }
   * ```
   *
   * @throws {NotFoundError} Si el usuario no existe
   */
  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Usuario obtenido exitosamente',
    });
  };

  /**
   * Obtiene un usuario por email
   *
   * Endpoint: GET /api/users/email/:email
   *
   * @method getUserByEmail
   * @param {Request} req - Request de Express con email en params
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Usuario encontrado con status 200
   *
   * @example
   * ```typescript
   * // Request: GET /api/users/email/user@example.com
   *
   * // Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "email": "user@example.com",
   *     "name": "John Doe",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "Usuario obtenido exitosamente"
   * }
   * ```
   *
   * @throws {NotFoundError} Si el usuario no existe
   */
  getUserByEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);

    return res.status(200).json({
      success: true,
      data: user,
      message: 'Usuario obtenido exitosamente',
    });
  };

  /**
   * Actualiza un usuario
   *
   * Endpoint: PUT /api/users/:id
   *
   * @method updateUser
   * @param {Request} req - Request de Express con id en params y UpdateUserDTO en body
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Usuario actualizado con status 200
   *
   * @example
   * ```typescript
   * // Request: PUT /api/users/123e4567-e89b-12d3-a456-426614174000
   * // Body:
   * {
   *   "name": "Jane Doe"
   * }
   *
   * // Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "email": "user@example.com",
   *     "name": "Jane Doe",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T12:00:00.000Z"
   *   },
   *   "message": "Usuario actualizado exitosamente"
   * }
   * ```
   *
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @remarks
   * - Solo se actualizan los campos proporcionados
   * - updatedAt se actualiza automáticamente
   */
  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userData: UpdateUserDTO = req.body;
    const updatedUser = await userService.updateUser(id, userData);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Usuario actualizado exitosamente',
    });
  };

  /**
   * Elimina un usuario
   *
   * Endpoint: DELETE /api/users/:id
   *
   * @method deleteUser
   * @param {Request} req - Request de Express con id en params
   * @param {Response} res - Response de Express
   * @returns {Promise<Response>} Confirmación de eliminación con status 200
   *
   * @example
   * ```typescript
   * // Request: DELETE /api/users/123e4567-e89b-12d3-a456-426614174000
   *
   * // Response:
   * {
   *   "success": true,
   *   "message": "Usuario eliminado exitosamente"
   * }
   * ```
   *
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @remarks
   * - Esta operación es irreversible
   * - Considerar implementar soft delete en producción
   */
  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await userService.deleteUser(id);

    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  };
}

/**
 * Instancia singleton del controlador de usuarios
 * Exportada para ser usada en las rutas
 */
export const userController = new UserController();

export default UserController;

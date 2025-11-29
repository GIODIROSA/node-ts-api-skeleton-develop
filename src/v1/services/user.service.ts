/**
 * @fileoverview Servicio de lógica de negocio para usuarios
 *
 * Contiene toda la lógica de negocio relacionada con usuarios.
 * Interactúa con la base de datos a través de Prisma y transforma
 * los datos entre modelos de Prisma y DTOs.
 *
 * @module v1/services/user.service
 * @requires @config/custom-error - Errores personalizados
 * @requires @config/db/prisma - Cliente de Prisma
 * @requires @config/logger - Sistema de logging
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

import { ConflictError, NotFoundError } from '@config/custom-error';
import prisma from '@config/db/prisma';
import Logger from '@config/logger';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserDTO,
} from '@interfaces/user/user.types';
import { User } from '@prisma/client';

/**
 * Logger específico para el servicio de usuarios
 */
const logger = new Logger('users.service');

/**
 * Servicio de usuarios
 *
 * Maneja toda la lógica de negocio relacionada con usuarios.
 * Proporciona métodos para crear, leer, actualizar y eliminar usuarios.
 *
 * @class UserService
 */
class UserService {
  constructor() {}

  /**
   * Obtiene un usuario por su email
   *
   * Busca un usuario en la base de datos usando su email como identificador.
   *
   * @method getUserByEmail
   * @param {string} email - Email del usuario a buscar
   * @returns {Promise<UserDTO>} Usuario encontrado
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * const user = await userService.getUserByEmail('user@example.com');
   * ```
   */
  async getUserByEmail(email: string): Promise<UserDTO> {
    logger.debug(`Buscando usuario con email: ${email}`);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toUserDTO(user);
  }

  /**
   * Crea un nuevo usuario en la base de datos
   *
   * Valida que el email no exista y crea el usuario con los datos proporcionados.
   *
   * @method createUser
   * @param {CreateUserDTO} userData - Datos del usuario a crear
   * @returns {Promise<UserDTO>} Usuario creado
   * @throws {Error} Si el email ya existe o hay error en la creación
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * const newUser = await userService.createUser({
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   * ```
   *
   * @remarks
   * - El email debe ser único en la base de datos
   * - Se generan automáticamente: id (UUID), createdAt, updatedAt
   * - Si necesitas autenticación, agrega el campo password al schema.prisma
   */
  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    logger.debug(`Creando usuario con email: ${userData.email}`);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    // Si el usuario ya existe, lanzar error de conflicto
    if (existingUser) {
      throw new ConflictError('El email ya existe');
    }

    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
      },
    });

    logger.info(`Usuario creado exitosamente: ${newUser.id}`);
    return this.toUserDTO(newUser);
  }

  /**
   * Obtiene un usuario por su ID
   *
   * Busca un usuario en la base de datos usando su ID único.
   *
   * @method getUserById
   * @param {string} id - ID del usuario (UUID)
   * @returns {Promise<UserDTO>} Usuario encontrado
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * const user = await userService.getUserById('123e4567-e89b-12d3-a456-426614174000');
   * ```
   */
  async getUserById(id: string): Promise<UserDTO> {
    logger.debug(`Buscando usuario con ID: ${id}`);
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.toUserDTO(user);
  }

  /**
   * Obtiene todos los usuarios
   *
   * Retorna una lista de todos los usuarios registrados en el sistema.
   *
   * @method getAllUsers
   * @returns {Promise<UserDTO[]>} Lista de usuarios
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * const users = await userService.getAllUsers();
   * ```
   */
  async getAllUsers(): Promise<UserDTO[]> {
    logger.debug('Obteniendo todos los usuarios');
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toUserDTO(user));
  }

  /**
   * Actualiza un usuario existente
   *
   * Actualiza los campos proporcionados del usuario. Los campos no incluidos
   * en el DTO no serán modificados.
   *
   * @method updateUser
   * @param {string} id - ID del usuario a actualizar
   * @param {UpdateUserDTO} userData - Datos a actualizar
   * @returns {Promise<UserDTO>} Usuario actualizado
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * const updatedUser = await userService.updateUser('user-id', {
   *   name: 'Jane Doe'
   * });
   * ```
   *
   * @remarks
   * - Solo se actualizan los campos proporcionados
   * - updatedAt se actualiza automáticamente
   */
  async updateUser(id: string, userData: UpdateUserDTO): Promise<UserDTO> {
    logger.debug(`Actualizando usuario: ${id}`);

    // Verificar que el usuario existe
    await this.getUserById(id);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    });

    logger.info(`Usuario actualizado exitosamente: ${id}`);
    return this.toUserDTO(updatedUser);
  }

  /**
   * Elimina un usuario
   *
   * Elimina permanentemente un usuario de la base de datos.
   *
   * @method deleteUser
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @example
   * ```typescript
   * const userService = new UserService();
   * await userService.deleteUser('user-id');
   * ```
   *
   * @remarks
   * - Esta operación es irreversible
   * - Considerar soft delete en producción
   */
  async deleteUser(id: string): Promise<void> {
    logger.debug(`Eliminando usuario: ${id}`);

    // Verificar que el usuario existe
    await this.getUserById(id);

    await prisma.user.delete({
      where: { id },
    });

    logger.info(`Usuario eliminado exitosamente: ${id}`);
  }

  /**
   * Convierte un modelo de Prisma User a UserDTO
   *
   * Método privado que transforma el modelo de base de datos a DTO,
   * excluyendo campos sensibles como password.
   *
   * @private
   * @method toUserDTO
   * @param {User} user - Usuario de Prisma
   * @returns {UserDTO} Usuario en formato DTO
   */
  private toUserDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();

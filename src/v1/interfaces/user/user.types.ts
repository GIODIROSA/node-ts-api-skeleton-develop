/**
 * @fileoverview Tipos e interfaces para el módulo de usuarios
 *
 * Define los DTOs (Data Transfer Objects) para separar las capas de la aplicación
 * y evitar exponer directamente los modelos de Prisma.
 *
 * @module v1/interfaces/user/user.types
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 */

/**
 * DTO para crear un nuevo usuario
 *
 * Contiene solo los campos necesarios para la creación de un usuario.
 * No incluye campos generados automáticamente como id, createdAt, updatedAt.
 *
 * @interface CreateUserDTO
 * @property {string} email - Email del usuario (debe ser único)
 * @property {string} name - Nombre completo del usuario
 *
 * @example
 * ```typescript
 * const newUser: CreateUserDTO = {
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * };
 * ```
 *
 * @remarks
 * Si necesitas agregar autenticación con contraseña, debes:
 * 1. Agregar el campo `password String` al modelo User en schema.prisma
 * 2. Ejecutar `npm run prisma:migrate` para crear la migración
 * 3. Agregar el campo password a este DTO
 */
export interface CreateUserDTO {
  email: string;
  name: string;
}

/**
 * DTO para respuesta de usuario
 *
 * Representa la información de un usuario que se devuelve al cliente.
 * No incluye campos sensibles como password.
 *
 * @interface UserDTO
 * @property {string} id - ID único del usuario (UUID)
 * @property {string} email - Email del usuario
 * @property {string} name - Nombre completo del usuario
 * @property {Date} createdAt - Fecha de creación del usuario
 * @property {Date} updatedAt - Fecha de última actualización
 *
 * @example
 * ```typescript
 * const user: UserDTO = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para actualizar un usuario
 *
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 *
 * @interface UpdateUserDTO
 * @property {string} [email] - Nuevo email del usuario
 * @property {string} [name] - Nuevo nombre del usuario
 *
 * @example
 * ```typescript
 * const updates: UpdateUserDTO = {
 *   name: 'Jane Doe'
 * };
 * ```
 *
 * @remarks
 * Si necesitas actualizar contraseñas, debes agregar el campo password
 * al modelo User en schema.prisma primero.
 */
export interface UpdateUserDTO {
  email?: string;
  name?: string;
}

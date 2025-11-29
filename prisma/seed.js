/**
 * @fileoverview Script de seed para poblar la base de datos con datos iniciales
 *
 * Este archivo se ejecuta para crear datos de prueba o iniciales en la base de datos.
 * Útil para desarrollo, testing y configuración inicial de ambientes.
 *
 * @module prisma/seed
 * @requires @prisma/client - Cliente de Prisma para interactuar con la BD
 *
 * @author Claudio Navarrete / Líder Técnico
 * @version 1.0.0
 *
 * @example
 * // Ejecutar el seed manualmente:
 * node prisma/seed.js
 *
 * // O usando el script de npm:
 * npm run prisma:seed
 */

const { PrismaClient } = require('@prisma/client');

// Inicializar cliente de Prisma
const prisma = new PrismaClient();

/**
 * Datos de usuarios de ejemplo para el seed
 *
 * @constant {Array<Object>} usersData
 * @property {string} email - Email único del usuario
 * @property {string} name - Nombre completo del usuario
 */
const usersData = [
  {
    email: 'admin@example.com',
    name: 'Administrador del Sistema',
  },
  {
    email: 'user1@example.com',
    name: 'Usuario de Prueba 1',
  },
  {
    email: 'user2@example.com',
    name: 'Usuario de Prueba 2',
  },
  {
    email: 'developer@example.com',
    name: 'Desarrollador',
  },
];

/**
 * Función principal del seed
 *
 * Ejecuta la lógica de población de la base de datos.
 * Crea usuarios de ejemplo si no existen.
 *
 * @async
 * @function main
 * @returns {Promise<void>}
 * @throws {Error} Si hay un error al crear los datos
 *
 * @remarks
 * **Comportamiento:**
 * - Verifica si cada usuario ya existe antes de crearlo
 * - No duplica usuarios con el mismo email
 * - Muestra logs de progreso en consola
 * - Usa transacciones implícitas de Prisma
 *
 * **Datos creados:**
 * - 4 usuarios de ejemplo con diferentes roles
 */
async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Contador de usuarios creados
  let createdCount = 0;
  let skippedCount = 0;

  // Crear usuarios
  console.log('📝 Creando usuarios...');
  for (const userData of usersData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`   ⏭️  Usuario ya existe: ${userData.email}`);
        skippedCount++;
        continue;
      }

      // Crear el usuario
      const user = await prisma.user.create({
        data: userData,
      });

      console.log(`   ✅ Usuario creado: ${user.email} (ID: ${user.id})`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error creando usuario ${userData.email}:`,
        error.message
      );
    }
  }

  // Resumen
  console.log('\n📊 Resumen del seed:');
  console.log(`   • Usuarios creados: ${createdCount}`);
  console.log(`   • Usuarios omitidos (ya existían): ${skippedCount}`);
  console.log(`   • Total procesados: ${usersData.length}`);
  console.log('\n✨ Seed completado exitosamente!\n');
}

/**
 * Ejecutar el seed y manejar errores
 *
 * @remarks
 * **Flujo de ejecución:**
 * 1. Ejecuta la función main()
 * 2. Si hay error, lo muestra en consola
 * 3. Desconecta Prisma Client
 * 4. Sale del proceso con código apropiado
 */
main()
  .catch((error) => {
    console.error('\n❌ Error ejecutando seed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    // Desconectar Prisma Client
    await prisma.$disconnect();
  });

/**
 * NOTAS PARA PERSONALIZAR EL SEED:
 *
 * 1. **Agregar más datos:**
 *    - Crea nuevos arrays de datos (ej: postsData, categoriesData)
 *    - Agrega nuevos bloques de creación en la función main()
 *
 * 2. **Relaciones entre modelos:**
 *    ```javascript
 *    const post = await prisma.post.create({
 *      data: {
 *        title: 'Mi Post',
 *        author: {
 *          connect: { id: user.id } // Conectar con usuario existente
 *        }
 *      }
 *    });
 *    ```
 *
 * 3. **Datos con password (si agregas autenticación):**
 *    ```javascript
 *    const bcrypt = require('bcrypt');
 *    const hashedPassword = await bcrypt.hash('password123', 10);
 *    const user = await prisma.user.create({
 *      data: {
 *        email: 'user@example.com',
 *        name: 'Usuario',
 *        password: hashedPassword
 *      }
 *    });
 *    ```
 *
 * 4. **Limpiar datos antes de seed (usar con cuidado):**
 *    ```javascript
 *    // ⚠️ CUIDADO: Esto elimina TODOS los datos
 *    await prisma.user.deleteMany({});
 *    console.log('🗑️  Datos anteriores eliminados');
 *    ```
 *
 * 5. **Seed condicional por ambiente:**
 *    ```javascript
 *    if (process.env.NODE_ENV === 'development') {
 *      // Crear datos de desarrollo
 *    } else if (process.env.NODE_ENV === 'production') {
 *      // Crear solo datos esenciales
 *    }
 *    ```
 */

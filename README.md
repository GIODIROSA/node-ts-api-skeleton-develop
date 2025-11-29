# 🚀 Node.js TypeScript API Skeleton

Esqueleto base para APIs REST construidas con Node.js, TypeScript, Express y Prisma ORM.
Diseñado con mejores prácticas, arquitectura escalable y documentación completa.

## 📋 Descripción

Este proyecto es un **skeleton/template** listo para usar que proporciona una base sólida para construir APIs REST profesionales. Incluye configuración completa de TypeScript, estructura de carpetas organizada, middlewares esenciales, sistema de logging, validaciones, y más.

## 🏗️ Arquitectura

El servicio está construido con:

- **Node.js 16+** + **TypeScript 5**
- **Express.js 5** como framework web
- **Prisma ORM** para gestión de base de datos PostgreSQL
- **Winston** para logging estructurado con rotación diaria
- **Express Validator** para validación de datos
- **Helmet** para seguridad HTTP
- **CORS** configurable
- **Rate Limiting** para protección contra abusos

### 📁 Estructura del Proyecto

```
node-ts-api-skeleton/
├── prisma/
│   ├── migrations/           # Migraciones de base de datos
│   ├── schema.prisma         # Esquema de base de datos
│   └── seed.js               # Script para poblar BD con datos iniciales
├── src/
│   ├── app.ts                # Configuración de Express
│   ├── server.ts             # Punto de entrada del servidor
│   ├── config/               # Configuraciones globales
│   │   ├── constants.ts      # Variables de entorno
│   │   ├── logger.ts         # Configuración de Winston
│   │   ├── custom-error.ts   # Clases de errores personalizados
│   │   ├── trace-context.ts  # Contexto de trazabilidad (AsyncLocalStorage)
│   │   └── db/
│   │       ├── index.ts      # Exportaciones de base de datos
│   │       └── prisma.ts     # Cliente Prisma singleton
│   ├── middlewares/          # Middlewares globales
│   │   ├── app.middleware.ts # Registro de middlewares
│   │   ├── audit.middleware.ts # Logging de requests/responses
│   │   ├── cors.middleware.ts
│   │   ├── error.middleware.ts # Manejo global de errores
│   │   ├── trace.middleware.ts # TraceID para trazabilidad
│   │   └── validate.middleware.ts # Procesamiento de validaciones
│   └── v1/                   # API versión 1
│       ├── constants/        # Constantes y mensajes
│       │   └── validation-messages.ts
│       ├── controllers/      # Controladores HTTP
│       │   └── user.controller.ts
│       ├── services/         # Lógica de negocio
│       │   └── user.service.ts
│       ├── routes/           # Definición de rutas
│       │   ├── index.ts      # Registro centralizado de rutas
│       │   ├── health.routes.ts
│       │   └── user.routes.ts
│       ├── validators/       # Validaciones con express-validator
│       │   ├── commons.validator.ts
│       │   └── user.validator.ts
│       ├── interfaces/       # DTOs y tipos TypeScript
│       │   └── user/
│       │       └── user.types.ts
│       ├── libs/             # Integraciones externas (README incluido)
│       └── utils/            # Utilidades reutilizables (README incluido)
├── .env.example              # Plantilla de variables de entorno
├── .eslintrc.cjs             # Configuración de ESLint
├── .prettierrc               # Configuración de Prettier
├── Dockerfile                # Configuración de imagen Docker
├── docker-compose.yml        # Orquestación de contenedores
├── api-requests.http         # Colección de requests para testing
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 16
- npm o yarn
- PostgreSQL >= 12
- Variables de entorno configuradas

### 📥 Instalación

```bash
# 1. Clonar o descargar el skeleton
git clone <repository-url>
cd node-ts-api-skeleton

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Crear la base de datos en PostgreSQL
# IMPORTANTE: Debes crear la base de datos ANTES de ejecutar las migraciones
# Opciones:

# Opción A: Usando psql (línea de comandos)
psql -U postgres -c "CREATE DATABASE \"node-ts-api-skeleton-db\";"

# Opción B: Usando createdb
createdb -U postgres node-ts-api-skeleton-db

# Opción C: Usando un cliente gráfico (pgAdmin, DBeaver, etc.)
# Crear manualmente una base de datos llamada: node-ts-api-skeleton-db

# 5. Generar cliente de Prisma
npm run prisma:generate

# 6. Ejecutar migraciones de base de datos
# Esto creará las tablas y estructura en la BD que creaste en el paso 4
npm run prisma:migrate

# 7. (Opcional) Poblar BD con datos iniciales
npm run prisma:seed
```

### ⚙️ Variables de Entorno

Configurar las siguientes variables en el archivo `.env`:

```env
# ===================================
# SERVIDOR
# ===================================
PORT=3000
NODE_ENV=development  # development | uat | production

# Ruta base de la API
API_PATH=/api/skeleton

# ===================================
# BASE DE DATOS
# ===================================
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=node-ts-api-skeleton-db
DB_PORT=5432

# URL de conexión completa
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/node-ts-api-skeleton-db?schema=public

# Ejecutar seed al iniciar
RUN_SEED=false

# Nivel de logging de Prisma
PRISMA_LOG_LEVEL=query,error,warn,info

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=debug  # error | warn | info | debug | trace
LOG_PATH=./logs
LOG_NAME=node-ts-api-skeleton

# ===================================
# SEGURIDAD
# ===================================
# CORS - Orígenes permitidos (separados por coma)
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
```

## 🏃‍♂️ Uso

### Desarrollo Local

```bash
npm run dev
```

### Producción

```bash
# 1. Compilar el proyecto
npm run build

# 2. Ejecutar el servidor compilado
NODE_ENV=production node dist/server.js
```

### 📜 Scripts Disponibles

| Script                          | Descripción                                        |
| ------------------------------- | -------------------------------------------------- |
| `npm run dev`                   | Ejecutar en modo desarrollo con hot-reload         |
| `npm run build`                 | Compilar TypeScript a JavaScript (carpeta `dist/`) |
| `npm run lint`                  | Ejecutar ESLint para verificar código              |
| `npm run prisma:generate`       | Generar cliente de Prisma                          |
| `npm run prisma:migrate`        | Crear y aplicar migraciones (desarrollo)           |
| `npm run prisma:migrate:deploy` | Aplicar migraciones (producción)                   |
| `npm run prisma:studio`         | Abrir Prisma Studio (interfaz visual de BD)        |
| `npm run prisma:seed`           | Poblar base de datos con datos iniciales           |

### 🐳 Scripts de Docker

| Script                         | Descripción                             |
| ------------------------------ | --------------------------------------- |
| `npm run docker:up`            | Levantar contenedores en segundo plano  |
| `npm run docker:down`          | Detener contenedores                    |
| `npm run docker:restart`       | Reiniciar contenedores                  |
| `npm run docker:rebuild`       | Reconstruir y levantar contenedores     |
| `npm run docker:rebuild:clean` | Reconstruir sin cache y levantar        |
| `npm run docker:logs`          | Ver logs de todos los contenedores      |
| `npm run docker:logs:api`      | Ver logs solo del contenedor API        |
| `npm run docker:logs:db`       | Ver logs solo del contenedor PostgreSQL |
| `npm run docker:shell`         | Abrir shell en el contenedor API        |
| `npm run docker:db:shell`      | Abrir psql en el contenedor PostgreSQL  |
| `npm run docker:clean`         | Detener y eliminar volúmenes            |
| `npm run docker:clean:all`     | Detener, eliminar volúmenes e imágenes  |

## 📡 API Endpoints

### Health Check

#### GET /health

Verifica el estado de la aplicación.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

### Usuarios (Ejemplo incluido)

#### POST /api/skeleton/users

Crea un nuevo usuario.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  },
  "message": "Usuario creado exitosamente"
}
```

#### GET /api/skeleton/users

Obtiene todos los usuarios.

#### GET /api/skeleton/users/:id

Obtiene un usuario por ID.

#### GET /api/skeleton/users/email/:email

Obtiene un usuario por email.

#### PUT /api/skeleton/users/:id

Actualiza un usuario.

#### DELETE /api/skeleton/users/:id

Elimina un usuario.

### 🧪 Testing de Endpoints

El proyecto incluye el archivo `api-requests.http` con una colección completa de requests para probar todos los endpoints. Compatible con:

- **VS Code**: Extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- **JetBrains IDEs**: Soporte nativo para archivos `.http`

## 🐳 Docker

El proyecto incluye configuración completa de Docker para desarrollo y producción.

### Desarrollo con Docker

```bash
# Levantar todos los servicios (API + PostgreSQL)
npm run docker:up

# Ver logs en tiempo real
npm run docker:logs

# Detener servicios
npm run docker:down
```

### Servicios incluidos

- **api**: Aplicación Node.js con hot-reload
- **postgres**: Base de datos PostgreSQL 15

### Reconstruir después de cambios

```bash
# Reconstruir con cache
npm run docker:rebuild

# Reconstruir sin cache (cambios en dependencias)
npm run docker:rebuild:clean
```

## ✨ Funcionalidades Incluidas

### 1. 🗄️ Base de Datos con Prisma ORM

- Cliente Prisma singleton para gestión eficiente
- Migraciones automáticas de esquema
- Type-safety completo con TypeScript
- Logging integrado de queries
- Prisma Studio para administración visual
- Script de seed documentado

### 2. 🔐 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso configurable
- **Express Validator**: Validación de datos de entrada
- **Rate Limiting**: Protección contra abusos (configurable)
- **Audit Middleware**: Logging de requests/responses

### 3. 📊 Sistema de Logging

- **Winston**: Logging estructurado
- **Rotación Diaria**: Archivos de log automáticos
- **TraceId**: Identificador único por request
- **Niveles**: error, warn, info, debug, trace
- **Sanitización**: Datos sensibles ocultos en logs

### 4. ✅ Validaciones

- Validadores reutilizables en `validators/commons.validator.ts`
- Validaciones específicas por módulo
- Mensajes estandarizados en `constants/validation-messages.ts`
- Middleware de validación centralizado

### 5. 🎯 Arquitectura Limpia

- **Separación de capas**: Routes → Controllers → Services
- **DTOs**: Separación entre modelos de BD y respuestas
- **Middlewares**: Procesamiento transversal
- **Error Handling**: Manejo centralizado de errores
- **Module Aliases**: Imports limpios con `@` prefix

### 6. � Documentación

- JSDoc completo en todos los archivos
- READMEs en carpetas `libs/` y `utils/`
- Ejemplos de uso en comentarios
- Comentarios explicativos en código

## 🏗️ Arquitectura del Proyecto

### Flujo de una Request

```
Request
  ↓
Middlewares Globales (CORS, Helmet, TraceID, Body Parser)
  ↓
Audit Middleware (Log de entrada)
  ↓
Routes (Definición de endpoints)
  ↓
Validators (Validación de datos)
  ↓
Controllers (Manejo de HTTP)
  ↓
Services (Lógica de negocio)
  ↓
Prisma/Libs (Base de datos / Servicios externos)
  ↓
Response
  ↓
Audit Middleware (Log de salida)
  ↓
Error Middleware (Si hay error)
```

### Module Aliases Configurados

| Alias          | Ruta                 | Uso                      |
| -------------- | -------------------- | ------------------------ |
| `@config`      | `src/config`         | Configuraciones globales |
| `@middlewares` | `src/middlewares`    | Middlewares de Express   |
| `@services`    | `src/v1/services`    | Lógica de negocio        |
| `@controllers` | `src/v1/controllers` | Controladores HTTP       |
| `@routes`      | `src/v1/routes`      | Definición de rutas      |
| `@validators`  | `src/v1/validators`  | Validaciones             |
| `@interfaces`  | `src/v1/interfaces`  | DTOs y tipos             |
| `@constants`   | `src/v1/constants`   | Constantes               |
| `@utils`       | `src/v1/utils`       | Utilidades               |
| `@libs`        | `src/v1/libs`        | Integraciones externas   |

## 📦 Dependencias Principales

### Producción

- **express** (^5.1.0) - Framework web
- **@prisma/client** (^6.19.0) - ORM
- **winston** (^3.18.3) - Logging
- **helmet** (^8.1.0) - Seguridad
- **cors** (^2.8.5) - CORS
- **express-validator** (^7.3.1) - Validaciones
- **uuid** (^11.1.0) - Generación de IDs

### Desarrollo

- **typescript** (^5.9.3) - Lenguaje
- **ts-node-dev** (^2.0.0) - Hot-reload
- **eslint** (^8.57.1) - Linter
- **prettier** (^3.6.2) - Formateador

## 🚀 Próximos Pasos

Una vez que tengas el skeleton funcionando, puedes:

1. **Agregar autenticación**:
   - Agregar campo `password` al modelo User en `schema.prisma`
   - Implementar JWT en los controllers
   - Crear middleware de autenticación

2. **Agregar más módulos**:
   - Copiar la estructura de `users/` para nuevos recursos
   - Crear nuevos modelos en Prisma
   - Registrar rutas en `src/v1/routes/index.ts`

3. **Integrar servicios externos**:
   - Crear clientes en `src/v1/libs/`
   - Seguir ejemplos del README en esa carpeta

4. **Agregar utilidades**:
   - Crear funciones en `src/v1/utils/`
   - Seguir ejemplos del README en esa carpeta

## 🐛 Troubleshooting

### Error: Database does not exist

```
PrismaClientInitializationError: Database `node-ts-api-skeleton-db` does not exist
```

**Solución**: Debes crear la base de datos manualmente antes de ejecutar las migraciones:

```bash
# Opción 1: Usando psql
psql -U postgres -c "CREATE DATABASE \"node-ts-api-skeleton-db\";"

# Opción 2: Usando createdb
createdb -U postgres node-ts-api-skeleton-db
```

Luego ejecuta las migraciones:

```bash
npm run prisma:migrate
```

### Error: Can't reach database server

```
Can't reach database server at `localhost:5432`
```

**Solución**: Verifica que PostgreSQL esté corriendo:

```bash
# Windows (PowerShell como administrador)
Get-Service -Name postgresql*

# Linux/Mac
sudo systemctl status postgresql
# o
brew services list | grep postgresql
```

### Error: Environment variable not found: DATABASE_URL

**Solución**: Verifica que el archivo `.env` existe y contiene la variable `DATABASE_URL`:

```bash
# Copiar desde el ejemplo si no existe
cp .env.example .env
```

Edita `.env` y asegúrate de que `DATABASE_URL` esté configurada correctamente.

## 🤝 Contribución

Este es un skeleton/template. Siéntete libre de:

- Modificar según tus necesidades
- Agregar o quitar funcionalidades
- Adaptar la estructura a tu proyecto
- Compartir mejoras

## 📄 Licencia

ISC License

## 🔗 Recursos

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Winston Documentation](https://github.com/winstonjs/winston)

---

**Autor:** Claudio Navarrete / Líder Técnico  
**Última actualización:** 2025

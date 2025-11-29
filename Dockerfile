# Etapa 1: Build
FROM node:18-alpine AS builder

# Instalar dependencias necesarias para Prisma y Git
RUN apk add --no-cache openssl git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src

# Generar cliente de Prisma
RUN npm run prisma:generate

# Compilar TypeScript
RUN npm run build

# Etapa 2: Production
FROM node:18-alpine

# Instalar dependencias necesarias para Prisma, Git y curl
RUN apk add --no-cache openssl git curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar schema de Prisma para migraciones
COPY --from=builder /app/prisma ./prisma

# Copiar script de inicio
COPY scripts/docker-entrypoint.sh ./

# Dar permisos de ejecución al script
RUN chmod +x docker-entrypoint.sh

# Cambiar propietario de archivos
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/health || exit 1

# Comando de inicio
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
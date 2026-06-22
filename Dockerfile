# ============================================================
# Stage 1: Build (Angular SSR)
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar el cache de capas
COPY package*.json ./

# Instalar todas las dependencias (necesarias para compilar Angular)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación Angular con SSR en modo producción
RUN npm run build

# ============================================================
# Stage 2: Production (SSR con Node)
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Solo instalar dependencias de runtime (express para SSR)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el output compilado de Angular (browser + server)
COPY --from=builder /app/dist ./dist

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Puerto del servidor SSR de Angular
EXPOSE 4000

# Arrancar el servidor SSR
CMD ["node", "dist/samts-front/server/server.mjs"]

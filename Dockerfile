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

# Fallar el build si los assets estáticos de public/ no llegaron al bundle.
# Evita desplegar una imagen que sirva versiones incompletas o inexistentes.
RUN test -d dist/samts-front/browser/images/boutique \
 && test -f dist/samts-front/browser/images/boutique/product-8.png \
 && test -f dist/samts-front/browser/images/boutique/ultimo-banner.png \
 && echo "OK: assets estáticos verificados"
# Si algún asset quedó como symlink en el bundle, el servidor podría servir un
# archivo vacío o truncado. Falla el build en ese caso.
RUN test -z "$(find dist/samts-front/browser -type l -print -quit)" \
 || (echo "ERROR: hay symlinks dentro del bundle de assets" && exit 1)

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

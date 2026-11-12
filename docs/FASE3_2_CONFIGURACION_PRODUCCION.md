# FASE 3.2 — AUDITORÍA DE CONFIGURACIÓN DE PRODUCCIÓN

**Fecha:** 12 de noviembre de 2026
**Alcance:** variables de entorno, CORS, JWT, almacenamiento, correo, SSR, Docker, Dokploy, health checks y logs.
**Regla cumplida:** no se revelan valores de secretos; no se modificó ninguna variable.

---

## 1. VARIABLES DE ENTORNO REQUERIDAS

### Backend (según `.env.example` y lectura de código)

| Variable | Requerida en producción | Valor/observación | Riesgo |
|---|---|---|---|
| `NODE_ENV` | ✅ **CRÍTICA** | Debe ser `production` (controla `synchronize`) | 🔴 Si falta, TypeORM auto-altera el esquema |
| `DATABASE_URL` | ✅ Crítica | Cadena PostgreSQL del entorno | — |
| `DB_SSL` | ⚠️ Según proveedor | `true` si la BD exige SSL | — |
| `JWT_SECRET` | ✅ **CRÍTICA** | Sin default seguro (ver §3) | 🔴 Default conocido si falta |
| `PORT` | ⚠️ | Por defecto `3000` | — |
| `EMAIL_PROVIDER` | ✅ | Debe permanecer `mock` | Debe mantenerse según reglas |
| `RESEND_API_KEY` | ⚠️ | Vacío mientras `EMAIL_PROVIDER=mock` | — |
| `EMAIL_FROM` | ⚠️ | Remitente transaccional | — |

### Frontend

| Variable / archivo | Valor de producción (no secreto) | Estado |
|---|---|---|
| `environment.ts` → `apiUrl` | `https://api.samts.app/api` | ✅ Sin `localhost` |
| `environment.ts` → `cloudinaryCloudName` | configurado | ✅ |
| `environment.ts` → `gaId` | configurado (GA4) | ✅ |
| `ALLOWED_HOSTS` (SSR) | `samts.app,www.samts.app` (override de `process.env`) | ⚠️ Debe definirse si el dominio difiere del default |
| `PORT` (SSR) | Por defecto `4000` | ⚠️ Debe alinearse con el puerto expuesto por Dokploy |

**Verificación de `localhost`:** el build de producción **no** contiene `localhost` en la configuración de API, porque la configuración `development` de `angular.json` es la única que aplica `fileReplacements` hacia `environment.development.ts` (que sí usa `http://localhost:3000/api`). La configuración `production` usa `environment.ts`. ✅

---

## 2. CONFIGURACIÓN DE COMPILACIÓN Y SSR (FRONTEND)

| Ítem | Estado | Evidencia |
|---|---|---|
| `outputMode` | `server` (SSR) | [angular.json](file:///home/profe/SAMTS/SAMTS-FRONT/angular.json#L37-L49) |
| Prerenderizado | 12 rutas públicas | salida del build |
| `allowedHosts` (build) | `samts.app`, `www.samts.app`, `localhost`, `127.0.0.1` | `angular.json` (`security.allowedHosts`) |
| `trust proxy` (SSR) | ✅ `app.set('trust proxy', true)` | [server.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/server.ts#L15) |
| Caché de assets | bundles hashed `immutable`; assets de `public/` `must-revalidate` | [server.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/server.ts#L41-L62) ✅ correcto |
| `ALLOWED_HOSTS` override | ✅ soportado por env | [server.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/server.ts#L17-L19) |
| Puerto SSR | `process.env.PORT || 4000` | [server.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/server.ts#L80-L89) |

> Si el panel admin o el sitio se sirven desde un dominio distinto de `samts.app`, **debe** definirse `ALLOWED_HOSTS`; de lo contrario el SSR rechazará el host (protección SSRF de Angular).

---

## 3. CONFIGURACIÓN JWT Y CORS (BACKEND)

### JWT
- **Hallazgo 🔴 (bloqueante de configuración):** [jwt.strategy.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/features/auth/strategies/jwt.strategy.ts#L9-L13) usa un **fallback inseguro**:
  ```
  secretOrKey: configService.get('JWT_SECRET') || 'super-secret-key-change-in-production'
  ```
  Si `JWT_SECRET` no se define en producción, se firma/valida con una clave pública y conocida → **cualquiera podría falsificar tokens**. Debe definirse un secreto largo y aleatorio.
- **Observación:** no se declara `expiresIn` explícito al firmar los tokens (depende de la configuración del `JwtModule`). Verificar que exista expiración razonable.

### CORS
- [main.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/main.ts#L13-L51): allowlist explícita (`https://samts.app`, `https://www.samts.app`, varios `localhost`) + permiso a cualquier `http://localhost:*` y `http://127.0.0.1:*`, con `credentials: true`.
- ✅ El frontend de producción (`samts.app`) está permitido.
- ⚠️ Cualquier **otro** dominio de producción (p. ej. un subdominio de admin, o `api.samts.app` si el navegador llamara directo) **no** estaría permitido. Verificar la URL real desde la que se sirve el panel y, si difiere, añadirla.
- ⚠️ El permiso a `localhost:*` es aceptable para desarrollo; conviene restringirlo por entorno, aunque no es un riesgo crítico.

### `synchronize` y `NODE_ENV`
- [app.module.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/app.module.ts#L29): `synchronize: process.env.NODE_ENV !== 'production'`. **Requisito:** `NODE_ENV=production` obligatorio en producción (ver informe de base de datos).

---

## 4. SWAGGER Y SUPERFICIE DE API

- **Hallazgo 🟠:** Swagger se monta **incondicionalmente** en `/docs` ([main.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/main.ts#L62-L70)), sin condicionar a `NODE_ENV`. En producción expone toda la superficie de la API (endpoints y esquemas). Recomendación: deshabilitar en producción o protegerlo.
- Prefijo global: `/api`. ✅

---

## 5. HEALTH CHECKS Y LOGS

| Ítem | Estado | Evidencia |
|---|---|---|
| Endpoint de salud | ❌ **Ausente** | `AppController` solo expone `GET /api` → `"Hello"` ([app.controller.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/app.controller.ts)) |
| Health check Docker/Dokploy | ⚠️ No definido | Los `Dockerfile` no declaran `HEALTHCHECK` |
| Logs | ⚠️ | `console.log`/`console.error` (sin logger estructurado). `lead-magnet.service.ts` registra email y notas del prospecto (datos personales) |
| Manejo global de errores | ⚠️ | No se detectó filtro global de excepciones; se depende de los filtros por defecto de Nest |

**Recomendación:** exponer `GET /api/health` (chequeo de proceso + BD) para que Dokploy valide el arranque, y evitar logging de PII en nivel `info` en producción.

---

## 6. DOCKER Y DESPLIEGUE

| Ítem | Backend | Frontend |
|---|---|---|
| Multi-stage | ✅ builder + production | ✅ builder + production |
| Imagen base | `node:22-alpine` | `node:22-alpine` |
| Instalación de runtime | `npm ci --omit=dev` | `npm ci --omit=dev` |
| Usuario no-root | ✅ (`appuser`) | ✅ (`appuser`) |
| Puerto expuesto | `3000` | `4000` |
| Comando | `node dist/main` | `node dist/samts-front/server/server.mjs` |
| Verificación de assets en build | n/a | ✅ cuenta ≥ 10 PNG + ausencia de symlinks |
| Ejecuta migraciones | ❌ No | n/a |

**Dokploy:** sin acceso desde este entorno → **NO VERIFICADO**. No se pudo confirmar:
- variables de entorno configuradas en el panel,
- dominio/subdominio real del frontend y backend,
- health check configurado,
- estrategia de despliegue (rolling/recreate),
- volumen/backup de PostgreSQL.

---

## 7. DISTINCIÓN DE ENTORNOS

| Elemento | Local | Pruebas | Producción |
|---|---|---|---|
| `apiUrl` frontend | `http://localhost:3000/api` | igual | `https://api.samts.app/api` ✅ |
| `EMAIL_PROVIDER` | `mock` | `mock` | **`mock`** (debe permanecer según reglas) |
| `NODE_ENV` | `development` | `test`/`development` | **`production`** (debe verificarse) |
| `DB_SSL` | `false` | según | probablemente `true` |
| `synchronize` | `true` | `true` | **`false`** (exige `NODE_ENV=production`) |
| CORS | localhost permitido | localhost | debe incluir el dominio real |

---

## 8. CHECKLIST DE CONFIGURACIÓN PARA PRODUCCIÓN (pendiente de verificar)

- [ ] `NODE_ENV=production` definido en el contenedor backend.
- [ ] `JWT_SECRET` con valor aleatorio largo (≥ 32 bytes) — **no** el default.
- [ ] `DATABASE_URL` apuntando a la BD de producción y `DB_SSL` correcto.
- [ ] `EMAIL_PROVIDER=mock` (preservado).
- [ ] CORS backend incluye el/los dominios reales del frontend.
- [ ] `ALLOWED_HOSTS` (SSR frontend) definido si el dominio ≠ `samts.app`.
- [ ] `PORT` del SSR alineado con el puerto que expone Dokploy.
- [ ] Swagger deshabilitado o protegido en producción.
- [ ] Endpoint `/api/health` disponible y conectado al health check de Dokploy.
- [ ] Logs sin PII sensible.
- [ ] Backup de PostgreSQL configurado antes de aplicar la migración.

---

## 9. CONCLUSIONES DE CONFIGURACIÓN

| Dimensión | Clasificación |
|---|---|
| Build de producción (sin `localhost`) | **APROBADO** |
| Dockerfiles (multi-stage, no-root) | **APROBADO** |
| SSR (trust proxy, caché, allowedHosts) | **APROBADO** |
| JWT secret | **BLOQUEANTE** (default inseguro si falta env) |
| `NODE_ENV` / `synchronize` | **BLOQUEANTE** (verificación obligatoria) |
| CORS del dominio real | **NO VERIFICADO** (depende de la URL real del panel) |
| Health checks | **BLOQUEANTE OPERATIVO** (endpoint ausente) |
| Swagger expuesto | **APROBADO CON OBSERVACIONES** |
| Configuración de Dokploy | **NO VERIFICADO** (sin acceso) |

**Conclusión:** la contenedorización y el SSR están bien resueltos, pero la **seguridad de la configuración de producción no puede darse por sentada** hasta que se verifiquen los tres puntos críticos (secret JWT, `NODE_ENV=production`, dominio CORS) y se añada un health check.

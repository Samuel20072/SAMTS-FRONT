# FASE 3.4 — Plan de Integración Git y Publicación Definitiva (NO EJECUTADO)

**Fecha:** 2026-11-12
**Repositorios:** `~/SAMTS/SAMTS-BACKEND` y `~/SAMTS/SAMTS-FRONT`
**Rama (ambos):** `feat/admin-operations-hub`
**Estado:** Propuesta. **No se ejecutó ningún paso de Git ni de despliegue.**

> ⚠️ Este documento agrupa §8 (preparación de Git) y §9 (plan definitivo de publicación) de
> la Fase 3.4. Ningún commit, push, merge ni despliegue fue ejecutado. Todo paso que toque
> producción requiere **autorización manual explícita**.

---

## PARTE A — §8 PREPARACIÓN DE GIT

### A.1 Estado inspeccionado (sin modificar)

| Repo | Rama | HEAD | Árbol de trabajo |
|---|---|---|---|
| SAMTS-BACKEND | `feat/admin-operations-hub` | `855fbdc` `fix(security): isolate commercial leads to SUPER_ADMIN...` | 14 modificados + 4 nuevos (health/, shared/config/, 3 specs) |
| SAMTS-FRONT | `feat/admin-operations-hub` | `adb83e7` `docs: Phase 3.1 comprehensive functional audit reports` | 7 modificados + docs `FASE3_2_*`, `FASE3_3_*`, `FASE3_4_*` sin commit |

No se descartó ninguna modificación. No se cambió de rama. No se hizo push/merge/cherry-pick.

### A.2 Clasificación de los cambios pendientes

#### BACKEND

**Correcciones de seguridad**
- `src/features/users/infrastructure/controllers/users.controller.ts` — añade `JwtAuthGuard` + `RolesGuard` + `@Roles(SUPER_ADMIN)`: cierra la creación anónima de administradores (bloqueante crítico de Fase 3.2).
- `src/features/sales/infrastructure/controllers/sales.controller.ts` — elimina el identificador ficticio `super-admin-global`; `resolveTargetClientId()` obliga a `clientId` real (UUID) para `SUPER_ADMIN` y fuerza el del token para usuarios de tenant.
- `src/features/sales/application/sales.service.ts` — valida el `Client` real en BD antes de crear la venta (bloquea IDs inexistentes o de otro tenant).
- `src/features/sales/application/dtos/create-sale.dto.ts` — añade `clientId?` (`@IsUUID`).
- `src/features/auth/auth.module.ts`, `src/features/auth/strategies/jwt.strategy.ts`, `src/shared/config/jwt.config.ts` — elimina el secret por defecto público; `resolveJwtSecret()` exige `JWT_SECRET` ≥ 32 caracteres y **falla al arrancar** si es inseguro.

**Correcciones funcionales (alineación de contratos FE↔BE)**
- `src/features/promotions/application/dtos/create-promotion.dto.ts` + `promotions.service.ts` — aceptan y respetan `isActive`.
- `src/features/products/application/dtos/create-product.dto.ts` + `products.service.ts` — aceptan y respetan `isActive` (toggle).
- `src/features/blog-posts/application/dtos/create-blog-post.dto.ts` + `blog-posts.service.ts` — aceptan `slug?` (si falta, se autogenera desde el `title`).

**Configuración**
- `src/app.module.ts` + `src/shared/config/database.config.ts` — `TypeOrmModule.forRootAsync` con `validateTypeOrmConfig()` al arranque y `resolveSynchronize()` (synchronize **solo** en `development`/`test`).
- `src/main.ts` — Swagger deshabilitado por defecto en producción (`ENABLE_SWAGGER=true` para habilitarlo).

**Nuevos módulos / features**
- `src/features/health/` — `health.module.ts`, `health.controller.ts`, `health.controller.spec.ts` (readiness con `SELECT 1`).

**Tests**
- `src/features/users/infrastructure/controllers/users.controller.security.spec.ts`
- `src/features/sales/application/sales.service.spec.ts`
- `src/features/sales/infrastructure/controllers/sales.controller.spec.ts`
- `src/features/health/health.controller.spec.ts`
- `src/shared/config/database.config.spec.ts`
- `src/shared/config/jwt.config.spec.ts`

#### FRONTEND

**Correcciones funcionales (alineación de contratos FE↔BE)**
- `src/app/pages/admin/pages/web-pages.component.ts` — deja de enviar `excerpt` (columna inexistente en el backend).
- `src/app/pages/admin/settings/settings.component.ts` — `saveSettings()` envía solo campos del DTO (evita `id`/`clientId` del GET → 400).
- `src/app/pages/admin/layout/admin-layout.component.ts` — copiloto: retira `title` del `actionPayload`, usa `featuredImage`, y limpia el payload de `update-whatsapp`.

**Correcciones de presentación (etiquetas financieras)**
- `src/app/pages/admin/analytics/analytics.component.ts`, `src/app/pages/admin/dashboard.page.html`, `src/app/pages/admin/leads/leads.component.ts` — renombran `wonRevenue` a "Valor Ganado (Estimado)" para no confundir valor estimado con dinero cobrado.

**Configuración / tests**
- `angular.json` — añade build config `test` (sin `fileReplacements` → `gaId` real en vez de `''`) y `buildTarget` del target `test`. Resuelve los 4 tests GA4 (13/13).

**Documentación (sin commit)**
- `docs/FASE3_2_*.md` (7), `docs/FASE3_3_*.md` (7), `docs/FASE3_4_*.md` (6).

### A.3 Verificación de secretos

- Backend: **no hay `.env` rastreado** (`.gitignore` correcto); solo `.env.example`, con `RESEND_API_KEY=` **vacío**.
- `git diff` de ambos repos: sin `secret`/`password`/`api_key`/`private_key` con valores reales.
- Frontend: solo `environment.ts` (público: `apiUrl`, `gaId`) y `environment.development.ts`; **sin credenciales**.
- Conclusión: **ningún archivo pendiente contiene secretos**.

### A.4 Propuesta de commits ordenados (NO EJECUTADOS)

> Orden por dependencia lógica y por criticidad. Los mensajes siguen el estilo Conventional
> Commits ya presente en el historial.

**BACKEND** (`feat/admin-operations-hub`)

```text
1) fix(security): require auth and SUPER_ADMIN on /api/users
   src/features/users/infrastructure/controllers/users.controller.ts
   src/features/users/infrastructure/controllers/users.controller.security.spec.ts

2) fix(security): forbid fictitious/foreign client ids in sales
   src/features/sales/application/dtos/create-sale.dto.ts
   src/features/sales/application/sales.service.ts
   src/features/sales/infrastructure/controllers/sales.controller.ts
   src/features/sales/application/sales.service.spec.ts
   src/features/sales/infrastructure/controllers/sales.controller.spec.ts

3) fix(config): fail-fast JWT secret and production synchronize
   src/shared/config/jwt.config.ts        src/shared/config/jwt.config.spec.ts
   src/shared/config/database.config.ts   src/shared/config/database.config.spec.ts
   src/features/auth/auth.module.ts       src/features/auth/strategies/jwt.strategy.ts
   src/app.module.ts

4) feat(health): add GET /api/health readiness probe with PostgreSQL check
   src/features/health/health.module.ts
   src/features/health/health.controller.ts
   src/features/health/health.controller.spec.ts

5) fix(config): disable Swagger in production by default
   src/main.ts

6) fix(api): align promotion/product/blog DTOs with frontend contracts
   src/features/promotions/application/dtos/create-promotion.dto.ts
   src/features/promotions/application/promotions.service.ts
   src/features/products/application/dtos/create-product.dto.ts
   src/features/products/application/products.service.ts
   src/features/blog-posts/application/dtos/create-blog-post.dto.ts
   src/features/blog-posts/application/blog-posts.service.ts

7) docs: add Phase 3.2/3.3/3.4 audit and release reports
   docs/*.md   (si se desea versionar los informes en el repo backend)
```

**FRONTEND** (`feat/admin-operations-hub`)

```text
1) fix(config): add test build configuration (GA4 unit tests)
   angular.json

2) fix(admin): align admin payloads with backend DTO contracts
   src/app/pages/admin/pages/web-pages.component.ts
   src/app/pages/admin/settings/settings.component.ts
   src/app/pages/admin/layout/admin-layout.component.ts

3) fix(admin): label wonRevenue as estimated (not collected) value
   src/app/pages/admin/analytics/analytics.component.ts
   src/app/pages/admin/dashboard.page.html
   src/app/pages/admin/leads/leads.component.ts

4) docs: add Phase 3.2/3.3/3.4 audit and release candidate reports
   docs/FASE3_2_*.md docs/FASE3_3_*.md docs/FASE3_4_*.md
```

**Reglas aplicadas:**
- No se ejecutó `git add`, `git commit`, `push`, `merge` ni `cherry-pick`.
- No se tocó `main`.
- Si se desea versionar los informes, el commit de docs va **al final** para no mezclar código con documentación.

---

## PARTE B — §9 PLAN DEFINITIVO DE PUBLICACIÓN

> 13 puntos solicitados. **Cada paso marcado [🔒 AUTORIZACIÓN]** no puede ejecutarse sin
> aprobación manual explícita del responsable. Ninguno fue ejecutado en esta fase.

### 1. Orden de integración de repositorios

```text
BACKEND → (migración BD) → desplegar backend → verificar → FRONTEND → verificar
```

El **backend debe integrarse y desplegarse antes** que el frontend, porque este último depende
de los nuevos contratos (campos de la migración + DTOs corregidos). El frontend nuevo **no**
es compatible con un backend antiguo en `/admin`.

### 2. Dependencias frontend/backend

- El frontend consume: `/api/dashboard`, `/api/lead-magnet/leads`, `/api/products`,
  `/api/promotions`, `/api/blog-posts`, `/api/ai-settings`, `/api/clients`, `/api/ai/*`, `/api/health`.
- La migración `20261110_01_...sql` añade columnas que el panel usa (`estimatedValue`, `dealStage`, `assignedTo`, `activityHistory`, `promotions.code`, `promotions.discountPercent`) y los recursos globales (`clientId = NULL`).
- Los fixes de contrato (§A.2) **deben** estar en el backend desplegado o `/admin` devolverá 400.
- **Conclusión:** migración + backend → antes que frontend. El backend es retrocompatible (cambios aditivos); el frontend **depende** del backend nuevo.

### 3. Commits que deben integrarse

- Todos los commits de §A.4 (backend: 1–7; frontend: 1–4).
- Requisito: crear los commits en la rama de trabajo (**sin push**) y mergearlos a `main`
  únicamente con autorización. **[🔒 AUTORIZACIÓN]**

### 4. Configuración requerida en Dokploy

- **Backend (servicio):** health check `GET /api/health` (200 healthy / 503 unhealthy), puerto = `PORT` (3000).
- **Frontend (servicio SSR):** `PORT` y `ALLOWED_HOSTS` (`samts.app`, `www.samts.app`).
- **Base de datos:** PostgreSQL 16 accesible por `DATABASE_URL`.
- **No se modifica** ninguna variable existente de Dokploy en esta fase.

### 5. Variables obligatorias

**Backend (obligatorias):**
- `NODE_ENV=production` (activa `synchronize=false` y deshabilita Swagger).
- `JWT_SECRET` — aleatorio, **≥ 32 caracteres** (el backend falla al arrancar si falta o es inseguro).
- `DATABASE_URL` — cadena de conexión real a PostgreSQL 16.
- `DB_SSL` — `true` si el proveedor lo exige.
- `PORT` — puerto del servicio.
- `EMAIL_PROVIDER=mock` — **no alterar** en esta publicación.

**Backend (opcionales):**
- `JWT_EXPIRES_IN` (default `1d`), `ENABLE_SWAGGER` (default deshabilitado en producción).

**Frontend (SSR):**
- `PORT`, `ALLOWED_HOSTS`.

> No se exponen valores reales. No se modificó ninguna variable de producción.

### 6. Backup de PostgreSQL **[🔒 AUTORIZACIÓN]**

```bash
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges \
  --file="samts_backup_$(date +%Y%m%d_%H%M%S).dump"
```

- Ejecutar **antes** de la migración, sobre la base de producción.
- Verificar el tamaño del archivo y su salida sin errores.

### 7. Verificación del backup

- Comprobar que el dump no está vacío y termina con código 0.
- Prueba de restauración en una base **aislada** (no producción):
  ```bash
  pg_restore --clean --if-exists --no-owner --dbname="<bd_de_verificacion>" <backup.dump>
  ```
- Confirmar conteo de tablas/registros clave (clients, users, lead_magnet, sales).

### 8. Migración **[🔒 AUTORIZACIÓN]**

- Archivo: `20261110_01_samts_global_resources_and_crm_expansion.sql`.
- **Idempotente, atómica y no destructiva** (validada en PostgreSQL 16 aislado en Fase 3.4).
- Aplicar **solo tras el backup verificado**, con el procedimiento documentado.
- No ejecutar `synchronize` en producción (garantizado por `NODE_ENV=production`).
- No modificar ni eliminar bases preexistentes.

### 9. Despliegue backend **[🔒 AUTORIZACIÓN]**

- Desplegar la imagen del backend con las variables de §5.
- Confirmar arranque sin errores de esquema (`column ... does not exist`).
- El arranque debe fallar si `JWT_SECRET` es inválido (fail-fast esperado).

### 10. Verificación del health check

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.samts.app/api/health   # esperado: 200
```

- `200` → `{"status":"ok","checks":{"database":"up"},"timestamp":"..."}`.
- `503` → `{"status":"error","checks":{"database":"down"},"timestamp":"..."}` (BD no lista).
- Configuración Dokploy: ruta `/api/health`, GET, healthy 200, unhealthy 503, intervalo 30 s, timeout 5 s, retries 3.

### 11. Despliegue frontend **[🔒 AUTORIZACIÓN]**

- Desplegar el build SSR con `PORT` y `ALLOWED_HOSTS` correctos.
- Confirmar que el build de producción usa `https://api.samts.app/api` (sin `localhost`).

### 12. Pruebas posteriores

- [ ] `GET /api/health` → 200.
- [ ] Login `SUPER_ADMIN` devuelve JWT válido.
- [ ] `POST /api/users` sin token → **401** (regresión de seguridad).
- [ ] `GET /api/lead-magnet/leads` → 403 a `CLIENT_ADMIN`, 200 a `SUPER_ADMIN`.
- [ ] `POST /api/sales` sin `clientId` como `SUPER_ADMIN` → 400; con UUID real → 201.
- [ ] Productos/Promociones/Blog: crear/editar/toggle → 2xx (sin 400 de contrato).
- [ ] `/admin` carga autenticado; datos persisten tras recargar; sin errores de consola/CORS.
- [ ] Swagger no expuesto en producción (`/docs` → 404 salvo `ENABLE_SWAGGER=true`).
- [ ] Logs sin credenciales ni errores de esquema.

### 13. Procedimiento de rollback

| Nivel | Acción |
|---|---|
| Frontend | Redesplegar la imagen anterior (sin cambios de esquema) — rollback trivial. |
| Backend | Redesplegar la imagen anterior; el esquema migrado es **compatible hacia atrás** (cambios aditivos). |
| Base de datos | La migración es no destructiva → **no es obligatorio** revertir. Si se requiere, usar el script de reversión documentado (Fase 3.2 §3.5). |
| Último recurso | Restaurar el `pg_dump` de §6. |

**Punto clave:** al ser aditivo, el rollback de aplicación **no** obliga a revertir la base de datos.

### Pasos que requieren autorización manual

Cada uno marcado **[🔒 AUTORIZACIÓN]** arriba: creación/merge de commits (§3), backup (§6),
migración (§8), despliegue backend (§9) y frontend (§11), y cualquier cambio en DNS o variables
de producción (fuera de alcance de esta fase).

---

## Resumen de restricciones respetadas

✅ No push · ✅ No merge · ✅ No cherry-pick · ✅ No deploy · ✅ No migración en producción ·
✅ No DNS · ✅ No variables de producción · ✅ `EMAIL_PROVIDER=mock` intacto ·
✅ Sin eliminación de datos preexistentes · ✅ Sin secretos en los cambios ·
✅ Ambos repos permanecen en `feat/admin-operations-hub`.

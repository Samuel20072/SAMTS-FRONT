# FASE 3.4 — Release Candidate SAMTS (Informe Ejecutivo)

**Fecha:** 2026-11-12
**Repositorios:** `~/SAMTS/SAMTS-BACKEND` y `~/SAMTS/SAMTS-FRONT`
**Rama (ambos):** `feat/admin-operations-hub`
**Alcance:** Preparación de publicación **sin desplegar, sin push, sin merge**.

---

## 1. Resumen ejecutivo

Se completó la preparación del Release Candidate. Durante la verificación de compatibilidad
frontend/backend (§6) se descubrieron **5 incompatibilidades reales de contrato** que
rompían el panel `/admin` con `HTTP 400`. Todas fueron corregidas y **verificadas con pruebas
E2E contra el backend real** y una base de datos PostgreSQL 16 aislada.

Estado global: **sin bloqueantes abiertos**. Quedan observaciones menores (ver §6).

| Área | Estado |
|---|---|
| Tests frontend (GA4) | ✅ 13/13 |
| Tests backend | ✅ 64/64 |
| Build frontend (SSR prod) | ✅ OK (1 warning SCSS preexistente) |
| Build backend | ✅ OK |
| Migración validada (PG16, idempotente, atómica) | ✅ |
| Configuración de producción fail-fast | ✅ |
| Health check 200/503 | ✅ |
| Contratos FE↔BE (`/admin`) | ✅ corregidos y E2E verificados |
| Secretos en cambios pendientes | ✅ ninguno |

---

## 2. Estado de Git (inicial, sin modificar)

**BACKEND** — HEAD `855fbdc` (`fix(security): isolate commercial leads to SUPER_ADMIN...`):
- Modificados (14): `src/app.module.ts`, `auth.module.ts`, `jwt.strategy.ts`, `main.ts`,
  `sales/*` (dto, service, controller), `users/infrastructure/controllers/users.controller.ts`,
  `products/*`, `promotions/*`, `blog-posts/*`.
- Nuevos: `src/features/health/`, `src/shared/config/`, y 3 specs
  (`sales.service.spec.ts`, `sales.controller.spec.ts`, `users.controller.security.spec.ts`).

**FRONTEND** — HEAD `adb83e7` (`docs: Phase 3.1 comprehensive functional audit reports`):
- Modificados (7): `angular.json`, `analytics.component.ts`, `dashboard.page.html`,
  `layout/admin-layout.component.ts`, `leads.component.ts`, `pages/web-pages.component.ts`,
  `settings/settings.component.ts`.
- Nuevos sin commit: 7 docs `FASE3_2_*` + 7 docs `FASE3_3_*` + los 6 docs `FASE3_4_*`.

> No se descartó ninguna modificación ni se cambió de rama.

---

## 3. §6 — Compatibilidad frontend/backend (hallazgos y correcciones)

Se levantó el backend compilado (`NODE_ENV=development`, puerto 3457) contra una BD
desechable (`samts_rc_e2e`) y se probaron los payloads **exactos** que emite el frontend.

### 3.1 Verificados correctamente (sin cambio)

- `POST /api/auth/register` → 201 (`accessToken`, `CLIENT_ADMIN` con `clientId`).
- `POST /api/products` (crear/editar) → coincide con `CreateProductDto`.
- `GET /api/dashboard`, `/users`, `/clients`, `/ai-settings`, `/sales`, `/lead-magnet/leads`
  → 200 con `SUPER_ADMIN`.
- `PATCH /api/lead-magnet/leads/:id/status` → `UpdateLeadStatusPayload` coincide con el DTO.
- URLs: producción usa **`https://api.samts.app/api`** (0 referencias a `localhost` en el
  build de producción).
- CORS: `samts.app` y `www.samts.app` permitidos.

### 3.2 Incompatibilidades encontradas y corregidas

| # | Ubicación | Error (400) | Causa | Corrección |
|---|---|---|---|---|
| 1 | `POST/PUT /api/promotions` | `property isActive should not exist` | El DTO no declaraba `isActive` aunque la entidad y el **toggle** de la UI sí lo usan | **Backend**: `isActive?` opcional en `CreatePromotionDto` + se respeta en `PromotionsService.create` |
| 2 | `PUT /api/products/:id` (toggle) | `property isActive should not exist` | `UpdateProductDto` no declaraba `isActive` | **Backend**: `isActive?` opcional en `CreateProductDto` + se respeta en `ProductsService.create` |
| 3 | `POST/PUT /api/blog-posts` | `property slug/excerpt should not exist` | El frontend enviaba `slug` y `excerpt`; el backend autogenera `slug` y no tiene columna `excerpt` | **Backend**: `slug?` opcional (si falta, se autogenera). **Frontend**: deja de enviar `excerpt` |
| 4 | `PUT /api/ai-settings` (Guardar) | `property id/clientId should not exist` | El componente mezclaba la respuesta del GET (`id`, `clientId`) en el cuerpo del PUT | **Frontend**: `saveSettings()` construye un payload sólo con campos del DTO |
| 5 | `POST /api/ai/generate-blog` (copiloto) | `property title should not exist` | El copiloto añadía `title` a un `GenerateContentDto` que no lo admite | **Frontend**: se retiró `title` del `actionPayload` |
| 6 | `POST /api/blog-posts` (copiloto) | `property excerpt/imageUrl should not exist` | El copiloto enviaba `excerpt` e `imageUrl` (debería ser `featuredImage`) | **Frontend**: payload del copiloto alineado al DTO |

### 3.3 Evidencia E2E tras las correcciones

```
PUT /api/products/:id {isActive:false}        -> 200  (isActive=false aplicado)
PUT /api/ai-settings (payload limpio)         -> 200  (autoGenerateWhatsappMessages=true)
POST /api/ai/generate-blog (sin title)        -> 201
POST /api/promotions  {isActive:false}        -> 201
POST /api/blog-posts  {slug, sin excerpt}     -> 201
POST /api/products    {isActive:true}         -> 201
PUT /api/promotions/:id {isActive:true}       -> 200  (toggle)
PUT /api/blog-posts/:id {title,slug,...}      -> 200
GET /api/health                               -> 200
```

> Las operaciones del CRM (`/api/lead-magnet/leads`) responden `403` a `CLIENT_ADMIN` **por
> diseño** (`@Roles(SUPER_ADMIN)`): el Centro de Operaciones es interno. Verificado `200`
> con un `SUPER_ADMIN`.

---

## 4. §7 — Validación visual y funcional de `/admin` (alcance real)

**Limitación:** el entorno **no dispone de herramienta de navegador** para QA visual
interactiva ni pruebas de responsive reales. Alcance alcanzado:

- ✅ Build de producción SSR sin errores.
- ✅ Smoke test SSR de rutas: `/`, `/login`, `/admin` (302 → `/admin/dashboard`),
  `/admin/dashboard`, `/pricing`, `/blog`, `/guia` → 200 con `app-root`/`router-outlet`.
- ✅ Validación funcional de los **contratos de API** de cada módulo del panel (dashboard,
  CRM, productos, promociones, blog, agentes, configuración) mediante E2E contra el backend.
- ⚠️ QA visual / responsive pendiente de ejecución en navegador real (no verificable aquí).

Módulos cubiertos por contrato: Dashboard, CRM (leads), Productos, Promociones, Blog
(Contenido), Agentes IA, Configuración IA. Analytics es de sólo lectura (sin contrato de
escritura). No se agregaron funcionalidades nuevas.

---

## 5. Correcciones de la fase (resumen de archivos)

**Backend (5 archivos):**
- `src/features/promotions/application/dtos/create-promotion.dto.ts` (+`isActive`)
- `src/features/promotions/application/promotions.service.ts` (respeta `isActive`)
- `src/features/products/application/dtos/create-product.dto.ts` (+`isActive`)
- `src/features/products/application/products.service.ts` (respeta `isActive`)
- `src/features/blog-posts/application/dtos/create-blog-post.dto.ts` (+`slug`)
- `src/features/blog-posts/application/blog-posts.service.ts` (slug explícito o autogenerado)

**Frontend (4 archivos):**
- `angular.json` (fix GA4: build config `test`)
- `src/app/pages/admin/pages/web-pages.component.ts` (no envía `excerpt`)
- `src/app/pages/admin/settings/settings.component.ts` (payload limpio ai-settings)
- `src/app/pages/admin/layout/admin-layout.component.ts` (payloads del copiloto)

---

## 6. Observaciones menores (no bloqueantes)

1. **Campo `excerpt` del formulario de blog (frontend):** no se persiste (el backend no tiene
   esa columna y el blog público deriva el extracto del `content`). El campo quedó como
   input cosmético; se recomienda removerlo de la UI en una tarea posterior.
2. **QA visual/responsive real:** pendiente de navegador (ver §4).
3. **Warning SCSS preexistente:** `business-demo-section.component.scss` = 209.66 kB
   (límite 200 kB). No relacionado con esta fase.
4. **Migración en producción:** validada localmente; su ejecución real requiere autorización
   manual y backup previo.

---

## 7. Restricciones respetadas

✅ No push · ✅ No merge · ✅ No cherry-pick · ✅ No deploy · ✅ No migración en producción ·
✅ No DNS · ✅ No variables de producción · ✅ `EMAIL_PROVIDER=mock` intacto ·
✅ Sin eliminación de datos preexistentes · ✅ Ambos repos permanecen en
`feat/admin-operations-hub` · ✅ Sin secretos en los cambios.

---

## 8. Decisión final

### **B — RELEASE CANDIDATE CON OBSERVACIONES**

- **No existen bloqueantes**: todas las incompatibilidades que rompían `/admin` fueron
  corregidas y verificadas E2E; seguridad, configuración, migración, health y QA (GA4) están
  aprobados.
- **Quedan pendientes menores** (no bloqueantes): limpieza del campo `excerpt`, QA visual en
  navegador real, y la ejecución de la migración bajo autorización manual en el despliegue.

> La aprobación de este Release Candidate **no autoriza** el despliegue. La publicación
> requiere la autorización manual explícita del responsable, conforme al plan
> (`FASE3_4_GIT_INTEGRATION_PLAN.md`).

# FASE 3.6 — Dependencias Frontend / Backend (SAMTS)

**Fecha:** 2026-11-12
**Alcance:** matriz de dependencias FE↔BE, contratos API, orden de integración y compatibilidad.

---

## 1. Orden de integración recomendado (resumen)

**BACKEND → MIGRACIONES → FRONTEND.**
El frontend consume endpoints y campos que **solo existen** tras integrar y migrar el backend.
Integrar el frontend primero dejaría el panel `/admin` con `HTTP 400/404` en varios módulos.

---

## 2. Matriz de dependencias

| Funcionalidad | Cambio backend | Cambio frontend | Dependencia | Riesgo |
|---|---|---|---|---|
| **Dashboard** | `dashboard.service.ts`, `dashboard-response.dto.ts`, `dashboard.controller.ts`, spec `dashboard-samts-operations.spec.ts` (fase 3) | `dashboard.page.ts/html`, `analytics.component.ts` (etiqueta estimado), `dashboard.service.ts` | FE espera campos `totalLeads…wonRevenue`, `totalProducts/BlogPosts/Promotions`, `recentLeads` | Medio: contrato amplio; validado E2E |
| **CRM / Leads** | `lead-magnet-lead.entity.ts` (+`estimatedValue`,`dealStage`,`assignedTo`,`activityHistory`), `update-lead-status.dto.ts`, `lead-magnet.service.ts`, controller (`@Roles(SUPER_ADMIN)`) | `leads.component.ts`, `lead-magnet-api.service.ts` | Requiere columnas CRM → **migración `20261110_01`** | **Alto si falta la migración** (columnas inexistentes) |
| **Clientes** | `clients.controller.ts` (multi-tenant, `PUT :id/plan`, `:id/active`) | `clients.service.ts` | Aislamiento por `clientId` | Medio |
| **Productos** | `create-product.dto.ts` (`isActive`), `product.entity.ts`, `products.service.ts`, repo, controller (`PATCH :id/stock`) | `products.component.ts`, `products.service.ts` | `clientId` ahora **nullable** (global SAMTS) → **migración `20261110_01`** | Medio |
| **Promociones** | `create-promotion.dto.ts` (`isActive`,`code`,`discountPercent`), `promotion.entity.ts`, repo, controller (`PATCH :id/active`) | `promotions.component.ts`, `promotions.service.ts` | `clientId` nullable + columnas `code/discountPercent` → **migración `20261110_01`** | Medio |
| **Blog (admin)** | `create-blog-post.dto.ts` (`slug`,`excerpt`), `blog-post.entity.ts` (`excerpt`), `blog-post-response.dto.ts`, servicio, controller | `web-pages.component.ts`, `blog-posts.service.ts` | Columna `excerpt` → **migración `20261112_01`** | **Alto si falta la migración** |
| **`excerpt` (público)** | Idem + repo `findBySlug`/`findAndCount` filtra `clientId IS NULL` (globales) | `blog.page.ts/html` (`getExcerpt` con fallback) | Requiere `excerpt` persistido | Bajo (fallback a `content`) |
| **AI Settings** | `ai-settings-response.dto.ts` (`id`,`clientId`), servicio, entity, repo, controller | `settings.component.ts`, `ai-settings.service.ts` | Payload PUT **sin** `id`/`clientId` (corregido) | Bajo (contrato alineado) |
| **Copilot (AI generation)** | `ai-generation.controller.ts` (`POST /ai/generate-blog`…), `generation-result.dto.ts` (`title,excerpt,content,slug`) | `admin-layout.component.ts` (payloads), `ai-generation.service.ts` | Campos `featuredImage` (no `imageUrl`) | Bajo |
| **Ventas** | `create-sale.dto.ts` (`clientId?`), `sales.service.ts` (valida cliente real), `sales.controller.ts` | `sales.service.ts` | `clientId` UUID real obligatorio; sin IDs ficticios | Medio (integridad de datos) |
| **Usuarios** | `users.controller.ts` (`JwtAuthGuard`+`RolesGuard`+`@Roles(SUPER_ADMIN)`) | `users.service.ts` | Solo SUPER_ADMIN | Bajo (endurecimiento) |
| **Autenticación** | `auth.module.ts`, `jwt.strategy.ts` usan `resolveJwtSecret()` | `auth.service.ts`, `auth.interceptor` | **`JWT_SECRET` obligatorio** en prod | **Alto si falta el secreto** (no arranca) |
| **Health check** | `health.controller.ts` (`GET /api/health`) | — (consumido por infra) | Requiere `DATABASE_URL` | Bajo |
| **Swagger** | `main.ts` (off en prod por defecto, `ENABLE_SWAGGER`) | — | — | Bajo |
| **Migraciones** | `20261110_01_*`, `20261112_01_*` (nuevas) | — | Bloquean CRM/Productos/Promociones/Blog/`excerpt` | **Alto si no se aplican** |

---

## 3. Contratos API relevantes (verificados contra el código)

| Endpoint | Método | Roles | Notas de contrato |
|---|---|---|---|
| `/api/auth/login`, `/api/auth/register` | POST | público | `accessToken` |
| `/api/users`, `/api/users/:id` | GET/POST | `SUPER_ADMIN` | Protegido (§3.5) |
| `/api/dashboard` | GET | JWT | DTO ampliado (fase 3) |
| `/api/clients` (+`/me`, `/:id/ai`, `/:id/plan`, `/:id/active`) | GET/POST/PUT | según endpoint | Multi-tenant |
| `/api/products` (+`/:id`, `/stock`) | GET/POST/PUT/PATCH/DELETE | admin/empleado | `isActive` opcional en create |
| `/api/promotions` (+`/:id`, `/:id/active`) | GET/POST/PUT/PATCH/DELETE | admin/empleado | `isActive`,`code`,`discountPercent` |
| `/api/blog-posts` (+`/:id`) | GET/POST/PUT/DELETE | admin/empleado | `slug?`,`excerpt?` |
| `/api/blog-posts/public` y `/public/slug/:slug` | GET | público | `clientId` opcional; sin él → globales SAMTS |
| `/api/ai-settings` | GET/PUT | admin/empleado | PUT **sin** `id`/`clientId` |
| `/api/ai/generate-blog|generate-promotion|generate-whatsapp|generate-banner`, `/api/ai/history` | POST/GET | admin/empleado | `excerpt` en resultado |
| `/api/sales` (+`/:id`, `/:id/status`) | GET/POST/PUT | admin/empleado | `clientId` real obligatorio |
| `/api/lead-magnet/leads` (+`/:id/status`, `/:id/converted`, campañas) | GET/POST/PATCH/DELETE | `SUPER_ADMIN` en lectura/gestión | CRM interno |
| `/api/notifications` (+`/:id/read`, `/read-all`) | GET/PATCH/POST | JWT | — |
| `/api/health` | GET | público | `{ checks: { database: 'up' } }` |

**Verificación clave solicitada:** la migración de `excerpt` **está versionada en el historial
backend** (`ee9591d` → `src/database/migrations/20261112_01_...sql`) y el frontend **no depende de
un campo inexistente**: `getExcerpt()` cae a `content` si `excerpt` es nulo, y el contrato de
creación/edición del backend lo acepta.

---

## 4. Compatibilidad de versiones y plataforma

| Componente | Versión / nota |
|---|---|
| Backend | NestJS 11 (TypeScript), TypeORM, `ConfigModule` |
| Frontend | Angular 21 standalone + SSR (`@angular/ssr`), PrimeNG, Tailwind 4 |
| Node | `node:22-alpine` en **ambos** Dockerfiles (build y runtime) |
| Base de datos | PostgreSQL 16 (validado en Fase 3.4/3.5) |
| Comunicación | REST/JSON; prefijo global `/api`; CORS con `credentials: true` |
| Frontend prod `apiUrl` | `https://api.samts.app/api` (sin `localhost`) |

**CORS (backend `main.ts`):** permite `https://samts.app`, `https://www.samts.app` y orígenes
`localhost`/`127.0.0.1`. El frontend SSR (servidor Node en puerto 4000) llama al backend
**server-side** (origen ausente → permitido por la regla `!origin`).

---

## 5. Riesgos de acoplamiento

1. **Backend sin migración + frontend nuevo:** Productos/Promociones/Blog/CRM fallan por columnas
   ausentes. → Aplicar migraciones **antes** de desplegar el frontend nuevo.
2. **`JWT_SECRET` ausente/inseguro en producción:** el backend **no arranca** (fail-fast). Debe
   configurarse antes del despliegue.
3. **`synchronize`:** en producción queda **off**; el esquema **solo** cambia por migración.
4. **Dashboard/CRM** son las superficies con contrato más amplio; su verificación post-despliegue
   es obligatoria (§ runbook).

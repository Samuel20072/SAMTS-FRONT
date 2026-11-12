# FASE 3.2 — AUDITORÍA FINAL Y PREPARACIÓN PARA LANZAMIENTO
## Centro de Operaciones Administrativas SAMTS

**Fecha de ejecución:** 12 de noviembre de 2026
**Auditor:** Arquitecto Full-Stack / Auditor QA
**Alcance:** SAMTS-BACKEND y SAMTS-FRONT, rama `feat/admin-operations-hub`
**Naturaleza:** Auditoría de solo lectura + corrección mínima de un hallazgo crítico de seguridad (sin push, sin merge, sin despliegue, sin tocar producción).

---

## 1. RESUMEN EJECUTIVO

SAMTS cuenta con un centro de operaciones administrativas **funcionalmente completo**: CRM, dashboard comercial, productos, promociones, blog, configuración de IA, analíticas y un panel multitenant coherente. Todas las suites técnicas pasan, ambos proyectos compilan en modo producción y el aislamiento multitenant está implementado de forma consistente en los módulos administrativos.

Sin embargo, la auditoría **encontró y corrigió una vulnerabilidad crítica** que los informes de la Fase 3.1 habían dado por aprobada: el controlador `/api/users` estaba **completamente desprotegido** (sin autenticación ni autorización), permitiendo a cualquier persona anónima crear un usuario con rol `SUPER_ADMIN` (toma de control total) y listar todos los usuarios del sistema.

Además, existen **bloqueantes operativos de publicación** que no pueden verificarse localmente y que deben resolverse antes de exponer la plataforma:

- La migración `20261110_01_recurso_globales...sql` **nunca se ha ejecutado contra producción** y **no existe un runner de migraciones** en la aplicación (es un script SQL manual).
- La configuración de producción (secrets JWT, `NODE_ENV`, CORS del dominio real, health checks) **no es verificable desde este entorno**.
- La clave JWT tiene un valor por defecto inseguro y conocido si no se define en producción.

**Veredicto:** **C) NO LISTO PARA PUBLICACIÓN** en su estado actual, por bloqueantes de configuración/migración de producción. *No queda ningún bloqueante de código nuevo tras la corrección aplicada.*

---

## 2. ESTADO DE CADA REPOSITORIO

| Aspecto | SAMTS-BACKEND | SAMTS-FRONT |
|---|---|---|
| Rama activa | `feat/admin-operations-hub` | `feat/admin-operations-hub` |
| HEAD | `855fbdc` — fix(security): isolate commercial leads to SUPER_ADMIN… | `adb83e7` — docs: Phase 3.1 comprehensive functional audit reports |
| Árbol de trabajo | Limpio antes de la auditoría; 2 archivos nuevos/modificados por la corrección (ver §6) | Limpio |
| Base común con `main` | `9f6587d` | `44ec555` |
| Commits por delante de `main` | 2 | 4 |
| Diff `main...HEAD` | 34 archivos, +761 / −166 | 38 archivos, +4166 / −1640 |
| `main` remoto | `9f6587d` (origin/main) | `44ec555` (origin/main) |

Ambos repos están en la rama de trabajo esperada, sin desviaciones inesperadas ni cambios ajenos en el árbol.

---

## 3. ESTADO DE CADA MÓDULO (contrastado con código real)

| Módulo | Backend | Frontend | Persistencia real | Aislamiento tenant |
|---|---|---|---|---|
| Autenticación (JWT) | ✅ | ✅ | `users` | `clientId` en payload JWT |
| Dashboard / Torre de Control | ✅ | ✅ | tiempo real | ✅ (`clientId=null` solo SUPER_ADMIN) |
| CRM / Leads | ✅ | ✅ | `lead_magnet_leads` | ✅ `@Roles(SUPER_ADMIN)` |
| Productos | ✅ | ✅ | `products` | ✅ `IsNull()` / tenant |
| Promociones | ✅ | ✅ | `promotions` | ✅ `IsNull()` / tenant |
| Blog / Contenido | ✅ | ✅ | `blog_posts` | ✅ `IsNull()` / tenant |
| Configuración IA | ✅ | ✅ | `ai_settings` | ✅ `IsNull()` / tenant |
| Agentes IA | ✅ | ✅ (tarjetas estáticas) | `ai_settings` | ✅ |
| Analíticas | ✅ | ✅ | reutiliza dashboard | ✅ |
| Usuarios (admin) | ⚠️ **corregido** | no usado | `users` | — |
| Ventas (POS tenant) | ⚠️ bug latente | no usado por admin | `sales` | parcial |

---

## 4. HALLAZGOS CRÍTICOS

### 4.1 🔴 CRÍTICO — `/api/users` sin autenticación (CORREGIDO en esta fase)

- **Ubicación:** `SAMTS-BACKEND/src/features/users/infrastructure/controllers/users.controller.ts`
- **Problema:** El controlador `UsersController` no declaraba `@UseGuards` y no existe un guard global (`APP_GUARD`) en `app.module.ts`. Por tanto `POST /api/users`, `GET /api/users` y `GET /api/users/:id` eran **públicos**.
- **Impacto:** `CreateUserDto` acepta `role` de tipo `UserRole` y `CreateUserUseCase` lo persiste. Un atacante anónimo podía crear `{ "role": "SUPER_ADMIN" }` (usuario global, sin `clientId`) → **escalada de privilegios total** y acceso a recursos globales de SAMTS. Adicionalmente, `GET /api/users` exponía todos los correos, nombres y roles.
- **Por qué la Fase 3.1 no lo detectó:** la auditoría de la Fase 3.1 se centró en los módulos comerciales (Products/Promotions/Blog/AISettings/Dashboard/Leads) y no cubrió el módulo `users`, contradiciendo su afirmación de "Seguridad Multitenant APROBADO".
- **Estado:** **CORREGIDO** (ver §6). No es un hallazgo heredado de la Fase 3, ya estaba en `main`.

### 4.2 🔴 CRÍTICO (configuración) — Clave JWT con valor por defecto inseguro
- **Ubicación:** `SAMTS-BACKEND/src/features/auth/strategies/jwt.strategy.ts:12`
- Si `JWT_SECRET` no está definido en producción, se usa `'super-secret-key-change-in-production'` (público y conocido) → cualquier atacante podría **falsificar JWT válidos**. Debe garantizarse el secret en producción (bloqueante operativo).

### 4.3 🔴 CRÍTICO (operación) — Migración nunca aplicada a producción, sin runner
- No existe infraestructura de migraciones TypeORM (`forRoot` sin `migrations`, sin `DataSource` CLI, sin `migrationsRun`). El archivo SQL se aplica manualmente. Si producción no lo aplica antes del nuevo backend, las consultas fallarán (`column ... does not exist`) o el login de SAMTS no encontrará configuración global. Ver informe de base de datos.

---

## 5. HALLAZGOS IMPORTANTES (no bloqueantes de código)

| # | Severidad | Hallazgo | Evidencia |
|---|---|---|---|
| 1 | Alta | Aislamiento por tenant basado en "verdad" de `clientId`: si un no-`SUPER_ADMIN` tuviera `clientId` nulo, `if (clientId && …)` **omite la verificación** y accedería a recursos globales de SAMTS. Mitigado al cerrar `/api/users`, pero conviene endurecer. | `products.service.ts:27`, `promotions.service.ts:29`, `blog-posts.service.ts:42` |
| 2 | Media | `POST /api/sales` usa `user.clientId \|\| 'super-admin-global'` como `clientId` — **viola** la afirmación de la Fase 3.1 ("sin UUID ficticios") e intentaría insertar un valor no-UUID en una FK uuid → error 500 para SUPER_ADMIN. | `sales.controller.ts:28` |
| 3 | Media | Swagger expuesto públicamente en `/docs` en cualquier entorno. | `main.ts:70` |
| 4 | Media | CORS: only `https://samts.app` / `www.samts.app`; se permite además cualquier `http://localhost:*`. Si el admin se sirve desde otro dominio de producción, CORS falla. | `main.ts:13-51` |
| 5 | Media | No existe endpoint `/health` para health checks de Dokploy (solo `GET /api` → "Hello"). | `app.controller.ts` |
| 6 | Media | El dashboard etiqueta `wonRevenue` como **"Ingresos Ganados"** y no muestra el dinero efectivamente cobrado (`totalRevenue`). Riesgo de confundir valor ganado con cobrado. | `dashboard.page.html:143-153` |
| 7 | Baja | Paginación de leads en memoria (cliente). Aceptable < 1.000 leads. | `FASE3_1_PENDIENTES.md` |
| 8 | Baja | `automations.service.ts` mantiene tareas de cron "simuladas" (solo log). Los cron de IA (2 AM) sí ejecutan generación real si un cliente activa auto-generación. | `automations.service.ts:38-93` |
| 9 | Baja | Tarjetas de Agentes IA con metadatos estáticos (los estados sí vienen de la API). | `agents.component.ts:133-176` |

---

## 6. CORRECCIONES APLICADAS

### Corrección 1 — Protección del controlador de usuarios (crítico)
- **Archivo modificado:** `SAMTS-BACKEND/src/features/users/infrastructure/controllers/users.controller.ts`
- **Cambio mínimo:** se añadieron `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.SUPER_ADMIN)` y `@ApiBearerAuth()` a nivel de clase.
- **Justificación:** el módulo no tiene UI en el panel admin y `UsersService` del frontend no se usa en ningún componente; restringir el controlador a `SUPER_ADMIN` no rompe ninguna funcionalidad y cierra la escalada de privilegios.
- **Pruebas añadidas:** `SAMTS-BACKEND/src/features/users/infrastructure/controllers/users.controller.security.spec.ts` (2 pruebas de regresión que verifican la presencia de guards y la restricción de rol).
- **Validación:** `npm test` → 6 suites / **29 tests passing**; `npm run build` → exit 0.

*No se aplicaron otras correcciones: los hallazgos restantes requieren decisiones de arquitectura, migración o configuración de producción, por lo que se documentan y NO se modifican (conforme a las reglas de la fase).*

---

## 7. PRUEBAS EJECUTADAS Y RESULTADOS REALES

| Verificación | Comando | Resultado |
|---|---|---|
| Tests backend | `npm test` | ✅ **6 suites / 29 tests passed** (incluye 2 nuevos) |
| Build backend | `npm run build` (`nest build`) | ✅ exit 0, 0 errores |
| Typecheck frontend | `npx tsc --noEmit -p tsconfig.app.json` | ✅ exit 0, 0 errores |
| Build producción frontend (SSR) | `ng build` (config `production`) | ✅ exit 0, **12 rutas prerenderizadas**, 1 warning de presupuesto SCSS |
| Aislamiento multitenant | Revisión de código (guards + `IsNull()`) | ✅ consistente en módulos comerciales |

### Pruebas NO ejecutadas (declaradas explícitamente)
- `npm run test:e2e` (backend E2E): **NO ejecutado**.
- Tests unitarios de componentes Angular (`ng test`): **NO ejecutados** (requiere provider de navegador headless no instalado; ver pendientes Fase 3.1).
- Verificación HTTP E2E contra base de datos viva: **NO ejecutada** — el contenedor PostgreSQL de SAMTS no está en ejecución (solo se detectó `tropical_postgres`).
- Aplicación de la migración o cualquier operación sobre base de datos: **NO ejecutada** (prohibido por reglas).
- Verificación de variables de producción en Dokploy: **NO ejecutada** (sin acceso).

---

## 8. RIESGOS Y PENDIENTES

- **Riesgos de publicación** detallados en `FASE3_2_PLAN_PUBLICACION.md` (secrets, CORS, migración, health checks).
- **Pendientes** consolidados en `FASE3_2_PENDIENTES.md`.
- **No verificado:** esquema real de la base de datos de producción, valores de secretos, configuración de Dokploy.

---

## 9. DECISIÓN FINAL DE LANZAMIENTO

| Dimensión | Clasificación |
|---|---|
| Funcionalidad administrativa | APROBADO |
| Componentes frontend | APROBADO CON OBSERVACIONES (etiquetado de `wonRevenue`, agentes estáticos) |
| Seguridad de aplicación | APROBADO CON OBSERVACIONES (crítico corregido; quedan hardening) |
| Base de datos / migraciones | **BLOQUEANTE** (migración no aplicada a producción, sin runner) |
| Configuración de producción | **BLOQUEANTE / NO VERIFICADO** (JWT secret, NODE_ENV, CORS, health check) |
| Rendimiento / SEO | APROBADO CON OBSERVACIONES (warning de presupuesto SCSS; noindex de admin vía robots.txt) |
| Pruebas técnicas | APROBADO (parcial; E2E y ejecución contra BD no realizadas) |

### VEREDICTO: **C) NO LISTO PARA PUBLICACIÓN**

Fundamento: aunque el único bloqueante de **código** detectado (la vulnerabilidad crítica de `/api/users`) ya fue corregido en la rama, persisten **bloqueantes operativos** que no pueden resolverse ni verificarse en este entorno: la migración de base de datos no se ha aplicado nunca a producción (y no hay runner automático), y la configuración crítica de producción (secret JWT, `NODE_ENV=production`, CORS del dominio real, health checks) está sin verificar.

Tras ejecutar el `FASE3_2_PLAN_PUBLICACION.md` (aplicar migración + completar checklist de variables + verificar CORS y health), la plataforma puede reclasificarse razonablemente a **B) LISTO CON PENDIENTES MENORES**.

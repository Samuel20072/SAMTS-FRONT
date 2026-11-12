# FASE 3.2 — PENDIENTES Y CLASIFICACIÓN PARA LANZAMIENTO

**Fecha:** 12 de noviembre de 2026
**Rama:** `feat/admin-operations-hub` (ambos repositorios)
**Clasificación:** APROBADO · APROBADO CON OBSERVACIONES · BLOQUEANTE · NO VERIFICADO

---

## 1. BLOQUEANTES (impiden la publicación)

| # | Bloqueante | Tipo | Evidencia | Acción requerida |
|---|---|---|---|---|
| B1 | **Migración nunca aplicada a producción y sin runner automático** | Base de datos / operación | `src/database/migrations/20261110_01_*.sql`; `app.module.ts` sin `migrations`/`migrationsRun` | Aplicar el SQL manualmente (idempotente) **antes** de desplegar el backend y registrar la ejecución |
| B2 | **`NODE_ENV` debe ser `production`** | Configuración | `app.module.ts:29` → `synchronize: NODE_ENV !== 'production'` | Garantizar `NODE_ENV=production`; de lo contrario TypeORM auto-altera el esquema |
| B3 | **`JWT_SECRET` con default inseguro** | Configuración / seguridad | `jwt.strategy.ts:12` (`'super-secret-key-change-in-production'`) | Definir un secreto aleatorio largo (≥ 32 bytes) en producción |
| B4 | **Sin endpoint de health check** | Configuración / operación | `app.controller.ts` solo expone `GET /api` | Implementar `/api/health` y conectarlo a Dokploy |

> B1–B4 son **bloqueantes operativos/de configuración**, no defectos de código nuevos. El único bloqueante de **código** (vulnerabilidad `/api/users`) fue **corregido** en esta fase.

---

## 2. APROBADO CON OBSERVACIONES

| # | Observación | Módulo | Impacto |
|---|---|---|---|
| O1 | `wonRevenue` etiquetado "Ingresos Ganados" (es valor estimado de oportunidad, no dinero cobrado) | Frontend / Dashboard | Confusión comercial |
| O2 | Verificación de tenant por "verdad" de `clientId` (`if (clientId && …)`) en update/delete | Backend / Products, Promotions, Blog | Hardening de seguridad |
| O3 | `POST /api/sales` usa identificador ficticio `'super-admin-global'` | Backend / Sales | Error de tipo en FK uuid para SUPER_ADMIN |
| O4 | Swagger expuesto públicamente en `/docs` | Backend | Superficie de información |
| O5 | CORS limitado al dominio actual; requiere verificación del dominio real | Backend | Bloqueo del panel si el dominio difiere |
| O6 | Panel admin usa `blue-*` de Tailwind en lugar del acento de marca `#315EFB` (~190 ocurrencias) | Frontend | Inconsistencia visual |
| O7 | Tarjetas de Agentes IA con metadatos hardcodeados (el estado sí viene de la API) | Frontend / Agents | Deuda técnica |
| O8 | Manejo de errores silencioso (`console.error`) sin feedback al usuario | Frontend | UX |
| O9 | Guard de `/admin` solo verifica autenticación, no rol | Frontend | Muestra pantallas vacías en lugar de redirigir (backend protege) |
| O10 | Paginación de leads en memoria (cliente) | Frontend / CRM | Escala limitada (~1.000 leads) |
| O11 | Warning de presupuesto SCSS (`business-demo-section` ≈ 209.66 kB > 200 kB) | Frontend / build | No bloqueante (límite de error 300 kB) |
| O12 | Cron "simulados" (solo log) en `automations.service.ts` | Backend | Funcionalidad parcial |
| O13 | JWT sin `expiresIn` explícito | Backend / Auth | Verificar expiración |

---

## 3. NO VERIFICADO (por falta de entorno)

| # | Elemento | Motivo |
|---|---|---|
| N1 | Configuración real de Dokploy (env, dominios, health checks, backups) | Sin acceso al panel |
| N2 | Esquema y estado real de la base de datos de producción | Entorno no disponible; prohibido tocar producción |
| N3 | Tests E2E backend (`npm run test:e2e`) | No ejecutados |
| N4 | Tests unitarios de componentes Angular (`ng test`) | Requiere navegador headless no instalado |
| N5 | Verificación E2E contra BD viva (login, CRUD, persistencia) | Contenedor PostgreSQL de SAMTS no en ejecución |
| N6 | Verificación visual interactiva responsive (desktop/tablet/móvil) | Sin entorno gráfico |
| N7 | Valores de los secretos de producción | Prohibido exponerlos |

---

## 4. DEUDA TÉCNICA HEREDADA (Fase 3.1, sigue vigente)

1. Paginación en servidor para leads (cuando supere ~1.000 registros).
2. WebSockets para notificaciones en tiempo real en el dashboard.
3. Proveedor de navegador headless para tests de componentes Angular.
4. Exportación real a PDF en Analíticas (botón simulado removido).
5. Tablero Kanban con drag & drop (`@angular/cdk/drag-drop`).

---

## 5. CORRECCIÓN APLICADA EN ESTA FASE

| Acción | Archivo | Estado |
|---|---|---|
| Protección de `/api/users` (antes sin guards) | `SAMTS-BACKEND/src/features/users/infrastructure/controllers/users.controller.ts` | ✅ Modificado (sin commit) |
| Prueba de regresión | `.../users.controller.security.spec.ts` | ✅ Nuevo (sin commit) |

Validación: `npm test` → 6 suites / 29 tests passing; `npm run build` → exit 0.

**Pendiente de commit:** la corrección está en el árbol de trabajo del backend, sin commitear (por la regla de no ejecutar acciones de Git sin autorización). Debe commitearse en la rama antes de publicar.

---

## 6. RESUMEN DE CLASIFICACIÓN POR DIMENSIÓN

| Dimensión | Clasificación |
|---|---|
| Funcionalidad administrativa | APROBADO |
| Persistencia / CRUD | APROBADO |
| Seguridad de aplicación (código) | APROBADO CON OBSERVACIONES (crítico corregido) |
| Seguridad de configuración | **BLOQUEANTE** (JWT secret, `NODE_ENV`) |
| Base de datos / migraciones | **BLOQUEANTE** (migración no aplicada, sin runner) |
| Configuración de producción | **BLOQUEANTE / NO VERIFICADO** |
| Frontend visual | APROBADO CON OBSERVACIONES |
| Rendimiento / SEO | APROBADO CON OBSERVACIONES |
| Pruebas | APROBADO PARCIAL / NO VERIFICADO (E2E y BD no ejecutadas) |
| Despliegue (Dokploy) | NO VERIFICADO |

---

## 7. RUTA CRÍTICA PARA LEVANTAR LOS BLOQUEANTES

1. Commitear la corrección de seguridad en la rama de backend.
2. Verificar/definir `NODE_ENV=production` y `JWT_SECRET` en producción.
3. Implementar `/api/health` (o aceptar explícitamente su ausencia).
4. Aplicar y verificar la migración con backup previo.
5. Verificar el dominio real en CORS y `ALLOWED_HOSTS`.
6. Ejecutar las verificaciones post-deploy del plan de publicación.

Tras completar 1–5, el proyecto puede reclasificarse razonablemente a **B) LISTO CON PENDIENTES MENORES**, siempre que las verificaciones post-deploy resulten satisfactorias.

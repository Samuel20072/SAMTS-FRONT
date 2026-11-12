# FASE 3.6 — Runbook de Despliegue (SAMTS)

**Fecha:** 2026-11-12
**Alcance:** procedimiento completo para integrar y publicar. **Este documento NO se ejecuta en
esta fase; es el plan a autorizar.**

> **Precondición:** autorización manual explícita. Esta fase no autoriza publicar.

---

## Paso 0 — Supuestos y componentes

| Componente | Descripción |
|---|---|
| Repo backend | `SAMTS-BACKEND`, `Dockerfile` (Node 22, `node dist/main`, puerto 3000) |
| Repo frontend | `SAMTS-FRONT`, `Dockerfile` (Angular SSR, `node dist/samts-front/server/server.mjs`, puerto 4000) |
| BD | PostgreSQL 16 |
| Orquestación | Dokploy (servicios/contenedores ya existentes) |

---

## Paso 1 — Preparación (antes de tocar nada)

1. **Verificar ramas y HEAD** en ambos repos:
   - Esperado: `feat/admin-operations-hub` @ `ee9591d` (BE) y @ `3ab98d2` (FR).
2. **Re-verificar el remoto** (no en esta fase): confirmar que `origin/main` sigue siendo
   `9f6587d` (BE) / `44ec555` (FR). Si avanzó, reevaluar conflictos.
3. **Confirmar ramas limpias** en ambos repos.
4. **Confirmar que las 13 unidades de cambio** siguen presentes en la rama.
5. **Confirmar migraciones** presentes: `20261110_01`, `20261112_01` (backend).
6. **Confirmar variables** requeridas (§7 de la auditoría de configuración).
7. **Confirmar estado de producción**: esquema real de BD (§3 de
   `FASE3_6_PRODUCTION_MIGRATIONS.md`).
8. **Ventana de mantenimiento** y responsable de rollback designado.

**Criterio de aborto:** si algún punto no se confirma, no continuar.

---

## Paso 2 — Integración backend (primero)

**Método recomendado:** fast-forward de `main` → `feat/admin-operations-hub` (no hay
divergencia; sin conflictos). Alternativa: merge commit si la política exige historial.

1. Asegurar `main` actualizado con el remoto (fetch/pull) **en el momento autorizado**.
2. Integrar preservando los commits (no squash recomendado para los de seguridad/config).
3. **Validaciones obligatorias post-integración:**
   - `npm ci && npm run build` → OK.
   - `npm test` → esperado **64/64**.
   - Revisar que las migraciones `20261110_01` y `20261112_01` estén incluidas.
4. **Conflictos potenciales:** ninguno previsto (fast-forward). Si aparece alguno, detener y
   reevaluar (indicaría que el remoto avanzó).

---

## Paso 3 — Integración frontend (después del backend)

1. Integrar `main` ← `feat/admin-operations-hub` (mismo método; sin conflicto previsto).
2. **Validaciones obligatorias post-integración:**
   - `npm ci && npm run build` → OK (advertencia SCSS esperada, ver nota).
   - `npx ng test --watch=false` → esperado **13/13**.
3. **Dependencia con backend:** el frontend usa endpoints/`excerpt`/`isActive` que requieren el
   backend y las migraciones ya desplegados. No publicar el frontend antes.
4. **Nota SCSS:** warning de presupuesto `business-demo-section.component.scss` = 209.66 kB
   (>200 kB, <300 kB). Es **preexistente** y no bloquea.

---

## Paso 4 — Base de datos

1. **Backup** completo y verificado (`pg_dump`) — ver `FASE3_6_PRODUCTION_MIGRATIONS.md` §4.
2. **Ventana de mantenimiento** (idealmente app en modo mantenimiento o tráfico bajo).
3. Ejecutar en orden:
   - `psql "$DATABASE_URL" -f src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql`
   - `psql "$DATABASE_URL" -f src/database/migrations/20261112_01_add_blog_post_excerpt.sql`
4. **Verificaciones SQL** posteriores (§6 de migraciones).
5. Si falla → **restaurar backup** y abortar el despliegue.

---

## Paso 5 — Despliegue

**Orden:** 1) **Backend** → 2) **verificar health** → 3) **Frontend**.

### 5.1 Backend
1. Reconstruir imagen con el nuevo código (`Dockerfile`).
2. Configurar variables (§7) **antes** de arrancar.
3. Desplegar el servicio backend.
4. **Health check obligatorio:** `GET https://api.samts.app/api/health` → `200` con
   `checks.database === "up"`. Si no responde `200`, **detener** y no continuar.

### 5.2 Frontend
1. Reconstruir imagen SSR (`Dockerfile`; el build prerenderiza 12 rutas estáticas).
2. Desplegar el servicio frontend (puerto 4000).
3. Verificar carga de la home y de `/blog`.

### 5.3 Verificaciones post-despliegue
- **Endpoints:** `/api/health`, login; `/api/dashboard` con token válido.
- **Login:** flujo completo usuario existente → token → acceso a `/admin`.
- **Administrador:** Dashboard, CRM (Leads), Productos, Promociones, Blog, Configuración IA,
  Ventas — crear/editar/activar (`isActive`) y confirmar persistencia.
- **Blog público:** `excerpt` visible (contenido o fallback a `content`).
- **Multitenancy:** un usuario de tenant **no** ve recursos de otro; `/api/users` → 401 sin token
  y 403 con `CLIENT_ADMIN`.
- **Logs:** revisar backend y SSR (frontend) en busca de errores 5xx.
- **Criterios de detención del despliegue:** health ≠ 200; errores 5xx en login/dashboard;
  columnas inexistentes en logs (migración no aplicada); CORS bloqueando el dominio.

---

## Paso 6 — Rollback

> **Regla:** no presentar como “rollback seguro” una operación que pueda perder datos.

| Componente | Rollback | Notas |
|---|---|---|
| **Frontend** | Redepliegue de la imagen anterior | Sin pérdida de datos. Seguro. |
| **Backend** | Redepliegue de la imagen `main` anterior | Sin pérdida de datos propia, **pero** el backend antiguo puede esperar un esquema anterior (compatibilidad: las migraciones son aditivas → el backend antiguo sigue funcionando). |
| **Base de datos** | **Restaurar backup previo** (preferido) | Las migraciones son aditivas; revertir por SQL puede **perder datos** y `SET NOT NULL` puede **fallar** (§5 migraciones). |
| **Migraciones no reversibles** | `20261110_01` no es reversible limpiamente; `20261112_01` solo perdiendo `excerpt` | Recomendado: fix-forward o restauración total del backup. |

**Orden de rollback ante fallo total:** detener frontend → detener backend → restaurar BD →
redesplegar versiones anteriores de ambos → verificar `/api/health`.

---

## Paso 7 — Notas Dokploy

- **Servicios a actualizar:** backend (puerto 3000) y frontend SSR (puerto 4000).
- **Orden:** backend → health OK → frontend.
- **Dependencias entre contenedores:** el frontend SSR llama al backend en el **build**
  (prerender) y en **runtime**; requiere que el backend esté disponible para el prerender de las
  rutas SSG/SSR.
- **Health checks:** configurar/verificar `GET /api/health` (backend) como probe de readiness.
- **Pasos manuales:** variables de entorno (§7), ejecución de migraciones (Paso 4), ventana de
  mantenimiento.
- **NO modificar Auto Deploy** ni la configuración de producción en esta fase.

---

## Paso 8 — Variables requeridas (backend)

| Variable | Valor esperado en producción | Obligatoria |
|---|---|---|
| `NODE_ENV` | `production` | ✅ |
| `DATABASE_URL` | `postgresql://…` | ✅ |
| `DB_SSL` | `true` si el proveedor lo exige | recomendado |
| `JWT_SECRET` | aleatorio, **≥32 caracteres**, distinto de valores por defecto | ✅ (**fail-fast**) |
| `EMAIL_PROVIDER` | `mock` (se mantiene sin cambios) | ✅ |
| `PORT` | `3000` (o el del servicio) | opcional |
| `ENABLE_SWAGGER` | ausente/`false` (Swagger off por defecto) | opcional |
| `RESEND_API_KEY` | **no modificar** | — |

> No imprimir valores de secretos en logs ni en este documento.

**Frontend:** no requiere variables de entorno en runtime; el build usa
`src/environments/environment.ts` (`apiUrl: https://api.samts.app/api`, `gaId` de producción).

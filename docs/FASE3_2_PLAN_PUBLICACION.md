# FASE 3.2 — PLAN DE PUBLICACIÓN (NO EJECUTADO)

**Fecha:** 12 de noviembre de 2026
**Estado:** Propuesta. **No se ejecutó ningún paso.** No hubo push, merge, despliegue ni cambios en producción.

> ⚠️ Este plan debe ejecutarse únicamente con autorización expresa del propietario.

---

## 1. ESTADO ACTUAL DE AMBAS RAMAS

| Aspecto | SAMTS-BACKEND | SAMTS-FRONT |
|---|---|---|
| Rama | `feat/admin-operations-hub` | `feat/admin-operations-hub` |
| HEAD | `855fbdc` | `adb83e7` |
| `origin/main` | `9f6587d` | `44ec555` |
| Commits por delante de `main` | 2 | 4 |
| Árbol de trabajo | **1 modificado + 1 nuevo** (corrección de seguridad de esta fase, sin commit) | Limpio salvo los informes `docs/FASE3_2_*.md` |
| Merge a `main` | ❌ No realizado | ❌ No realizado |
| Push | ❌ No realizado | ❌ No realizado |

**Pendiente antes de publicar:** *commitear* (no push) la corrección de seguridad del backend en la rama de trabajo, para que el cambio quede versionado. No se realizó por la regla de no ejecutar acciones de Git sin autorización.

---

## 2. DIFERENCIAS FRENTE A `main`

| Repo | Archivos | Inserciones | Eliminaciones | Contenido funcional |
|---|---|---|---|---|
| Backend | 34 | +761 | −166 | Recursos globales SAMTS, CRM expandido, aislamiento multitenant, limpieza de leads a SUPER_ADMIN |
| Frontend | 38 | +4166 | −1640 | Panel `/admin` completo (dashboard, leads, productos, promociones, blog, analíticas, agentes, settings), identidad visual, SSR |

---

## 3. DEPENDENCIAS ENTRE FRONTEND Y BACKEND

- El frontend consume: `/api/dashboard`, `/api/lead-magnet/leads`, `/api/products`, `/api/promotions`, `/api/blog-posts`, `/api/ai-settings`, `/api/clients`.
- El nuevo panel **requiere** los campos añadidos por la migración (`estimatedValue`, `dealStage`, `assignedTo`, `activityHistory`, `promotions.code`, `promotions.discountPercent`) y los recursos globales (`clientId = NULL`).
- **Por tanto no son desplegables de forma independiente:** la migración y el backend deben preceder al frontend. Si el frontend nuevo se despliega antes, las llamadas a esos campos fallarían.
- El backend **sí** es retrocompatible con navegadores/clientes antiguos tras la migración (cambios aditivos), pero el frontend nuevo **depende** del backend nuevo.

---

## 4. ORDEN RECOMENDADO DE INTEGRACIÓN

1. **Backup de la base de datos de producción** (`pg_dump` completo).
2. **Aplicar la migración** `20261110_01_samts_global_resources_and_crm_expansion.sql` (ver `FASE3_2_AUDITORIA_DATABASE.md`, §5) con verificaciones previas y posteriores.
3. **Verificar variables de entorno del backend** (checklist de `FASE3_2_CONFIGURACION_PRODUCCION.md`, §8) — en especial `NODE_ENV=production` y `JWT_SECRET`.
4. **Desplegar el backend** y confirmar arranque + endpoints.
5. **Verificar el backend** (health/`GET /api`, login, un CRUD, aislamiento de tenant).
6. **Desplegar el frontend** (build SSR) con `ALLOWED_HOSTS` y `PORT` correctos.
7. **Verificaciones posteriores** (§8) y monitoreo.

---

## 5. MIGRACIONES NECESARIAS

- **Única migración requerida:** `20261110_01_samts_global_resources_and_crm_expansion.sql`.
- Es **idempotente, atómica y no destructiva** (ver informe de base de datos).
- **No hay runner automático:** debe aplicarse manualmente y registrarse.
- **No re-ejecutar** migraciones ya aplicadas (por idempotencia, no fallaría, pero se debe llevar control).
- **No** ejecutar `synchronize` en producción (garantizar `NODE_ENV=production`).

---

## 6. VARIABLES DE ENTORNO REQUERIDAS

**Backend (críticas):** `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (aleatorio, ≥ 32 bytes), `DB_SSL`, `PORT`, `EMAIL_PROVIDER=mock`, `EMAIL_FROM` (+ `RESEND_API_KEY` solo si se activa correo real — **no** en esta publicación).
**Frontend (SSR):** `ALLOWED_HOSTS` (si el dominio ≠ default), `PORT` (alineado con Dokploy).

> No se exponen valores. No se modificó ninguna variable.

---

## 7. ORDEN DE DESPLIEGUE (resumen)

```
[1] Backup BD
        ↓
[2] Migración SQL (manual, verificada)
        ↓
[3] Backend (env verificadas)  →  [4] Smoke test backend
        ↓
[5] Frontend SSR (ALLOWED_HOSTS/PORT)  →  [6] Smoke test frontend
        ↓
[7] Verificaciones post-deploy + monitoreo
```

Justificación: la BD y el backend deben estar listos antes del frontend, porque este último depende de los esquemas y endpoints nuevos.

---

## 8. VERIFICACIONES POSTERIORES AL DESPLIEGUE

- [ ] `GET /api` responde 200 (y `/api/health` si se implementa).
- [ ] Login con `SUPER_ADMIN` devuelve JWT válido.
- [ ] `GET /api/dashboard` refleja datos reales y no rompe con la BD migrada.
- [ ] `GET /api/lead-magnet/leads` responde 403 para usuarios no-`SUPER_ADMIN` y 200 para `SUPER_ADMIN`.
- [ ] `POST /api/users` responde **401** sin token (regresión de la corrección crítica).
- [ ] Crear/editar producto y promoción global (`clientId = NULL`) y verificar que un `CLIENT_ADMIN` **no** lo ve.
- [ ] El frontend carga `/admin` autenticado; los datos persisten tras recargar.
- [ ] Sin errores de consola ni CORS en el navegador.
- [ ] robots.txt/sitemap accesibles; `/admin` fuera del sitemap.
- [ ] Logs sin errores de esquema (`column ... does not exist`).

---

## 9. ESTRATEGIA DE ROLLBACK

| Nivel | Acción |
|---|---|
| Frontend | Redesplegar la imagen anterior (Docker) — sin cambios de esquema, rollback trivial |
| Backend | Redesplegar la imagen anterior; el esquema migrado es **compatible hacia atrás** (cambios aditivos), por lo que el backend antiguo sigue funcionando |
| Base de datos | La migración es no destructiva; **no es obligatorio** revertir el esquema. Si se requiere, usar el script de reversión documentado en `FASE3_2_AUDITORIA_DATABASE.md` §3.5 (**salvo** restaurar `NOT NULL` si ya hay recursos globales) |
| Último recurso | Restaurar el `pg_dump` previo (recomendado tenerlo antes de migrar) |

**Punto clave:** al ser aditivo, el rollback de aplicación no obliga a revertir la base de datos.

---

## 10. RIESGOS IDENTIFICADOS

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| 1 | Desplegar backend nuevo **sin** aplicar la migración → errores 500 por columnas inexistentes | 🔴 Alta | Aplicar y verificar la migración **antes** del backend |
| 2 | `NODE_ENV` no es `production` → `synchronize=true` altera el esquema automáticamente | 🔴 Alta | Verificar `NODE_ENV=production` |
| 3 | `JWT_SECRET` ausente → se usa el secret por defecto → falsificación de tokens | 🔴 Alta | Definir secret aleatorio largo |
| 4 | CORS no incluye el dominio real del panel → frontend bloqueado | 🟠 Media | Verificar/añadir el dominio real en la allowlist |
| 5 | `ALLOWED_HOSTS` no coincide con el dominio → SSR rechaza el host | 🟠 Media | Definir `ALLOWED_HOSTS` |
| 6 | Ausencia de health check → Dokploy no detecta fallo de arranque | 🟠 Media | Implementar `/api/health` y configurarlo |
| 7 | Swagger público en producción | 🟡 Baja | Deshabilitar/proteger en producción |
| 8 | Verificación de tenant por "verdad" de `clientId` (hardening) | 🟡 Baja | Endurecer comprobación en una fase posterior |
| 9 | `wonRevenue` mal etiquetado como "Ingresos Ganados" → interpretación comercial errónea | 🟠 Media | Corregir etiqueta/mostrar cobrado real |
| 10 | Sin tests E2E ni verificación contra BD real | 🟡 Baja | Ejecutar E2E en preproducción antes del cutover |

---

## 11. NOTA FINAL

Este plan **no fue ejecutado**. La publicación requiere: (a) commitear la corrección de seguridad en la rama, (b) aplicar y verificar la migración, (c) completar y verificar el checklist de variables de producción, y (d) ejecutar las verificaciones post-deploy. Ninguna de estas acciones puede darse por hecha sin autorización y acceso al entorno de producción.

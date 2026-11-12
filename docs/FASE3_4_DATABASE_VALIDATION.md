# FASE 3.4 — Validación local de PostgreSQL y migración

**Repositorio:** `~/SAMTS/SAMTS-BACKEND`
**Rama:** `feat/admin-operations-hub`
**Fecha:** 2026-11-12
**Migración validada:** `src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql`

---

## 1. Entorno de pruebas aislado

Se verificó primero el estado de los contenedores existentes y **no se tocó ninguno** de
terceros ni se eliminaron volúmenes:

| Contenedor | Estado | Puerto | Acción |
|---|---|---|---|
| `tropical_postgres` | running (ajeno al proyecto) | 5432 | **NO TOCADO** |
| `samts_qa_postgres` | exited | — | no modificado |
| `samts-postgres` | exited | — | no modificado |
| **`samts_rc_pg`** (nuevo) | running | `127.0.0.1:55432` | instancia de validación desechable |

- Imagen: `postgres:16-alpine` (compatibilidad PostgreSQL 16).
- Base de datos dedicada: **`samts_rc_validation`** (desechable, jamás producción).
- Se usó el puerto **55432** para evitar colisión con el 5432 ocupado por `tropical_postgres`.

## 2. Procedimiento ejecutado

El script de migración se aplicó con `psql` **únicamente** contra `samts_rc_validation`.
La migración contiene 6 operaciones idempotentes dentro de `BEGIN; … COMMIT;`:

1. `ALTER TABLE products  ALTER COLUMN "clientId" DROP NOT NULL`
2. `ALTER TABLE promotions ALTER COLUMN "clientId" DROP NOT NULL`
3. `ALTER TABLE blog_posts ALTER COLUMN "clientId" DROP NOT NULL`
4. `ALTER TABLE ai_settings ALTER COLUMN "clientId" DROP NOT NULL`
5. `ADD COLUMN` de recursos globales/CRM: `products.code`, `products.discountPercent`,
   `lead_magnet_leads.estimatedValue`, `.assignedTo`, `.dealStage`, `.activityHistory`
6. `CREATE INDEX IF NOT EXISTS` (6 índices)

## 3. Resultados de verificación

| # | Prueba | Resultado |
|---|---|---|
| 5 | Aplicación inicial | ✅ `exit 0`, todas las operaciones aplicadas |
| 6 | `clientId` pasa a nullable | ✅ `is_nullable = YES` en las 4 tablas |
| 7 | Columnas nuevas y tipos | ✅ `activityHistory jsonb DEFAULT '[]'`, `estimatedValue numeric DEFAULT 0.00`, etc. |
| 8 | Índices | ✅ 6 índices creados |
| 9 | Foreign keys | ✅ 4 FKs intactas |
| 10 | Consistencia de datos | ✅ Datos preservados (ej. `leads = 2`), defaults aplicados |
| 11–12 | **Segunda ejecución (idempotencia)** | ✅ `NOTICE "already exists, skipping"`, sin cambios ni error |
| 13 | Recurso global | ✅ Insert de `clientId NULL` aceptado (modelo híbrido global/tenant) |
| 14 | Manejo de errores / rollback | ✅ Fallo simulado dentro de `BEGIN/COMMIT` → error + rollback; la columna temporal **no** quedó creada |

## 4. Compatibilidad y manejo de errores

- **PostgreSQL 16**: todos los tipos (`jsonb`, `numeric(10,2)`, `uuid`, `timestamp`) y
  sintaxis `ADD COLUMN IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` soportados.
- **Segunda ejecución**: segura (idempotente) — un redeploy repetido no rompe el esquema.
- **Atomicidad**: cualquier fallo revierte el bloque completo; no quedan estados parciales.
- **Consistencia**: los datos preexistentes se conservan; los nuevos campos toman sus
  defaults sin requerir backfill manual.

## 5. Aislamiento y garantías

- ❌ No se ejecutó la migración contra producción.
- ❌ No se eliminó ni modificó ninguna base de datos preexistente.
- ❌ No se eliminaron volúmenes de contenedores existentes.
- ✅ El contenedor de validación y su base de datos son desechables y se eliminan al
  cerrar la fase (no forman parte de la entrega).

## 6. Conclusión

La migración `20261110_01` es **segura, idempotente y atómica** sobre PostgreSQL 16, con
preservación de datos y manejo correcto de errores. El procedimiento documentado queda
**validado** y apto para ejecutarse (bajo autorización manual) sobre producción tras el
backup obligatorio descrito en el plan de publicación.

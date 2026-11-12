# FASE 3.6 — Migraciones de Producción (SAMTS)

**Fecha:** 2026-11-12
**Alcance:** migraciones que se incorporarían a producción, riesgo, backup, ejecución y
recuperación. **No se ejecutó ninguna migración.**

---

## 1. Inventario de migraciones

El backend **no tiene runner de migraciones**: no existe `data-source.ts`, ni `ormconfig`, ni un
script de migraciones en `package.json`. Las migraciones son **archivos SQL versionados** que se
ejecutan **manualmente** (procedimiento heredado de la Fase 3.3).

| Migración | Propósito | Estado conocido | Riesgo | Acción necesaria |
|---|---|---|---|---|
| `src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql` | (1) `clientId` **nullable** en `products`, `promotions`, `blog_posts`, `ai_settings` (recursos globales SAMTS); (2) columnas `code`, `discountPercent` en `promotions`; (3) columnas CRM (`estimatedValue`,`assignedTo`,`dealStage`,`activityHistory`) en `lead_magnet_leads`; (4) índices | **Nueva respecto a `main`** (no existe en `main`). **Estado real de producción desconocido** (requiere consultar su BD) | **Medio-alto**: cambia `NOT NULL` de 4 tablas y añade columnas al CRM. Idempotente | Revisar esquema real de producción y **aplicar antes** de desplegar backend/frontend nuevos |
| `src/database/migrations/20261112_01_add_blog_post_excerpt.sql` | Añade columna `excerpt text` (nullable) a `blog_posts` | **Nueva respecto a `main`** (creada en Fase 3.5, commit `ee9591d`). **Estado real de producción desconocido** | **Medio**: la entidad `BlogPost.excerpt` la requiere; sin ella, las consultas a `blog_posts` fallan en prod (`synchronize` está off) | **Aplicar antes** de desplegar el backend con la entidad nueva |

**Contenido verificado (resumen):**

`20261110_01` (dentro de `BEGIN; … COMMIT;`):
```sql
ALTER TABLE products     ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE promotions   ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE promotions   ADD COLUMN IF NOT EXISTS code character varying(50);
ALTER TABLE promotions   ADD COLUMN IF NOT EXISTS "discountPercent" integer;
ALTER TABLE blog_posts   ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE ai_settings  ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "estimatedValue" numeric(12,2) DEFAULT 0.00;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "assignedTo" character varying(100);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "dealStage" character varying(50);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "activityHistory" jsonb DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_leads_status / idx_leads_created_at / idx_leads_email
                       / idx_products_client_id / idx_promotions_client_id / idx_blog_posts_client_id;
```

`20261112_01` (dentro de `BEGIN; … COMMIT;`):
```sql
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt text;
```

---

## 2. Verificaciones de seguridad de las migraciones

| Criterio | `20261110_01` | `20261112_01` |
|---|---|---|
| Versionada en Git | ✅ (nueva vs `main`) | ✅ (commit `ee9591d`) |
| Duplicada | ❌ no | ❌ no |
| Compatible PostgreSQL 16 | ✅ (`ADD COLUMN IF NOT EXISTS`, `DROP NOT NULL`) | ✅ |
| Idempotente | ✅ (las 4 sentencias `ADD COLUMN`/`CREATE INDEX` usan `IF NOT EXISTS`; `DROP NOT NULL` es no-op repetible) | ✅ |
| Elimina datos | ❌ no elimina filas ni columnas | ❌ no |
| Modifica registros innecesarios | Solo **relaja** `NOT NULL` (no reescribe datos) | No |
| Registros anteriores | Compatibles (`estimatedValue` default `0.00`, `activityHistory` default `[]`; `clientId` nullable no rompe filas existentes) | Los posts existentes quedan con `excerpt = NULL` (compatible; el frontend deriva de `content`) |
| Rollback limpio | **No limpio** (ver §5) | **Parcialmente reversible** (ver §5) |

---

## 3. Estado real de producción: NO verificable en esta fase

No se puede determinar sin consultar la base de datos de producción (prohibido en esta fase).
Dos escenarios posibles y su implicación:

1. **Producción creada con `synchronize: true`** (configuración antigua "fail-open", antes de la
   Fase 3.3): algunas columnas podrían **ya existir** por auto-sincronización de TypeORM. En ese
   caso las migraciones siguen siendo **seguros de aplicar** (idempotentes).
2. **Producción sin las columnas**: las migraciones son **obligatorias** antes del despliegue.

> **Acción de verificación previa (fuera de esta fase):** sobre la BD de producción (réplica o
> lectura) comprobar `information_schema.columns` para `products.clientId.nullable`,
> `promotions.code`, `blog_posts.excerpt`, `lead_magnet_leads.estimatedValue`. Documentar el
> resultado antes de ejecutar.

---

## 4. Backup requerido (obligatorio)

Antes de aplicar cualquier migración:

```bash
# Backup lógico completo previo a la ventana de despliegue
pg_dump "$DATABASE_URL" --format=custom --file="samts_backup_pre_36_$(date +%Y%m%d_%H%M%S).dump"
```

- Guardar el dump **fuera** del servidor de base de datos.
- Verificar integridad (`pg_restore --list <dump>`).
- Confirmar que el dump terminó **sin errores** antes de continuar.

---

## 5. Estrategia de recuperación (rollback)

> **Las migraciones son aditivas pero su reversión puede perder datos.** No presentar el rollback
> como “seguro” si implica borrar columnas con datos.

| Migración | Reversión técnica | ¿Pérdida de datos? | Recomendación |
|---|---|---|---|
| `20261112_01` | `ALTER TABLE blog_posts DROP COLUMN excerpt;` | **Sí** — se pierden los `excerpt` guardados | Preferir **restaurar el backup** o **fix-forward**; no ejecutar el DROP si hay excerpts valiosos |
| `20261110_01` | `DROP COLUMN code/discountPercent/estimatedValue/assignedTo/dealStage/activityHistory`; `DROP INDEX …`; **re-imponer `SET NOT NULL`** | **Sí**, y además `SET NOT NULL` **fallará** si existen filas con `clientId = NULL` (recursos globales) | **No revertir por SQL.** Recuperar por **restauración del backup** |

**Principio:** ante un fallo tras aplicar migraciones, la vía segura es **restaurar el backup
previo** (esquema + datos coherentes), no intentar deshacer `NOT NULL`/columnas en caliente.

---

## 6. Orden de ejecución

1. **Backup** (§4) verificado.
2. **Migración `20261110_01`** (base estructural: multitenancy global + CRM).
3. **Migración `20261112_01`** (`excerpt`).
4. Verificaciones posteriores:

```sql
-- clientId debe ser nullable en las 4 tablas
SELECT table_name, is_nullable FROM information_schema.columns
 WHERE column_name='clientId'
   AND table_name IN ('products','promotions','blog_posts','ai_settings');

-- columnas nuevas presentes
SELECT column_name FROM information_schema.columns
 WHERE table_name='promotions' AND column_name IN ('code','discountPercent');
SELECT column_name FROM information_schema.columns
 WHERE table_name='lead_magnet_leads'
   AND column_name IN ('estimatedValue','assignedTo','dealStage','activityHistory');
SELECT column_name FROM information_schema.columns
 WHERE table_name='blog_posts' AND column_name='excerpt';
```

5. Si todo es correcto → continuar con el despliegue de backend/frontend.
6. Si algo falla → **restaurar backup** y detener el despliegue.

---

## 7. Notas de riesgo

- **Ambas migraciones son nuevas respecto a `main`** → en la primera publicación llegan juntas.
- **No hay tabla de control de migraciones de TypeORM**: no se registra su aplicación. La
  idempotencia es la garantía de seguridad ante re-ejecución.
- **`synchronize` off en producción** (Fase 3.3): el esquema **solo** evoluciona por estas
  migraciones; olvidarlas deja el backend inconsistente con la entidad.

# FASE 3.3 — MIGRACIONES DE BASE DE DATOS

**Migración revisada:** `src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql`
**Repositorio:** `~/SAMTS/SAMTS-BACKEND`

> **Esta fase NO ejecuta la migración ni se conecta a producción.** Solo se analiza y se documenta un procedimiento seguro.

---

## 1. Contenido de la migración

| # | Operación | Idempotente |
|---|---|---|
| 1 | `ALTER TABLE products ALTER COLUMN "clientId" DROP NOT NULL` | Sí |
| 2 | `ALTER TABLE promotions ALTER COLUMN "clientId" DROP NOT NULL` + `ADD COLUMN IF NOT EXISTS code` + `discountPercent` | Sí |
| 3 | `ALTER TABLE blog_posts ALTER COLUMN "clientId" DROP NOT NULL` | Sí |
| 4 | `ALTER TABLE ai_settings ALTER COLUMN "clientId" DROP NOT NULL` | Sí |
| 5 | `ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS estimatedValue / assignedTo / dealStage / activityHistory` | Sí |
| 6 | `CREATE INDEX IF NOT EXISTS` (6 índices) | Sí |
| — | Envuelto en `BEGIN; ... COMMIT;` | Transaccional |

---

## 2. Análisis de idempotencia y compatibilidad

- **`DROP NOT NULL`** es idempotente en PostgreSQL: no produce error si la columna ya es nullable.
- **`ADD COLUMN IF NOT EXISTS`** y **`CREATE INDEX IF NOT EXISTS`** son idempotentes (PostgreSQL 9.6+).
- **Ejecución duplicada:** segura — la segunda ejecución no altera nada.
- **PostgreSQL 16:** compatible. Se usan `numeric(12,2)`, `jsonb`, `varchar`, `IF NOT EXISTS` y `ALTER COLUMN` estándar.
- **Atomicidad ante interrupciones:** al estar dentro de una transacción, cualquier fallo o interrupción ejecuta `ROLLBACK` y el esquema queda intacto. PostgreSQL soporta DDL transaccional.
- **Operaciones destructivas:** ninguna. No hay `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` ni borrado de datos.
- **Compatibilidad con registros existentes:** las columnas nuevas son `NULL`-ables o tienen `DEFAULT` (`estimatedValue DEFAULT 0.00`, `activityHistory DEFAULT '[]'`); los `NOT NULL` existentes solo se relajan. No se rompe ninguna fila previa.
- **Validación contra entidades:** los nombres y tipos coinciden con las entidades TypeORM:
  - `Promotion.code` (`varchar`), `Promotion.discountPercent` (`integer`), `clientId` nullable.
  - `LeadMagnetLead.estimatedValue` (`decimal(12,2)`), `assignedTo`, `dealStage`, `activityHistory` (`jsonb`, default `'[]'`), `status`, `email`, `createdAt` (de `BaseEntity`).
  - `Product`, `BlogPost`, `AiSettings`: `clientId` nullable.

### Consideración de bloqueo
Los `CREATE INDEX` (sin `CONCURRENTLY`) toman un lock que bloquea escrituras sobre `lead_magnet_leads`, `products`, `promotions` y `blog_posts` durante su creación. Para tablas pequeñas/medianas es despreciable. Si `lead_magnet_leads` fuese muy grande en producción, considerar crear los índices con `CREATE INDEX CONCURRENTLY` **fuera de la transacción** (ejecutándolos por separado y después). Se documenta como opción, no se modifica el archivo.

---

## 3. Mecanismo de versionamiento de migraciones

### Estado actual
El proyecto **no dispone** de un runner de migraciones. TypeORM está configurado **sin** `migrations` (la carpeta `src/database/migrations/` contiene SQL que se aplica manualmente). No existe tabla que registre migraciones aplicadas.

### Solución propuesta (compatible, sin sistema paralelo)
Se propone un registro mínimo en la propia base de datos, que no altera el modelo de negocio ni duplica herramientas:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          varchar(255) PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now(),
  checksum    varchar(64)
);
```

Cada archivo se registra por su nombre (p. ej. `20261110_01_samts_global_resources_and_crm_expansion.sql`) al final de su aplicación, dentro de la **misma transacción**:

```sql
INSERT INTO schema_migrations (id, checksum)
VALUES ('20261110_01_samts_global_resources_and_crm_expansion.sql', '<sha256 del archivo>')
ON CONFLICT (id) DO NOTHING;
```

Esto permite:
- Saber qué migraciones ya se aplicaron antes de volver a ejecutar.
- Detectar deriva (drift) comparando `checksum`.
- Mantener una única fuente de verdad (los archivos SQL existentes).

> No se implementa un runner automático ni se añade una carpeta de migraciones TypeORM nueva para no crear un sistema paralelo innecesario. La creación de `schema_migrations` es opcional y se propone como parte del procedimiento.

---

## 4. Procedimiento de ejecución controlada (para una fase posterior)

> **PROHIBIDO en esta fase:** conectarse a producción, ejecutar la migración, modificar registros reales o hacer cambios destructivos. El procedimiento siguiente es una guía para ejecución futura y autorizada.

1. **Ventana de mantenimiento / aviso.** Ejecutar en una ventana controlada.
2. **Backup previo.**
   ```bash
   pg_dump --format=custom --no-owner --no-privileges \
     "$PROD_DATABASE_URL" > backup_pre_20261110_01.dump
   ```
3. **Verificación del backup.** Restaurar en una base de staging y comprobar integridad (`pg_restore --list`, conteos de tablas clave).
4. **Inspección del esquema actual.** Confirmar el estado de las columnas afectadas:
   ```sql
   SELECT column_name, is_nullable, data_type
   FROM information_schema.columns
   WHERE table_name IN ('products','promotions','blog_posts','ai_settings','lead_magnet_leads')
   ORDER BY table_name, ordinal_position;
   ```
5. **Validación de precondiciones.**
   - Confirmar que las tablas y columnas objetivo existen.
   - Confirmar que la migración no está ya registrada (si existe `schema_migrations`).
6. **Ejecución de la migración** (una sola vez, en transacción):
   ```bash
   psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 \
     -f src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql
   ```
   El archivo ya incluye `BEGIN; ... COMMIT;` y todas las sentencias son idempotentes.
7. **Verificación de columnas e índices.**
   ```sql
   \d promotions
   \d lead_magnet_leads
   SELECT indexname FROM pg_indexes
   WHERE indexname LIKE 'idx_leads_%' OR indexname LIKE 'idx_products_client_id'
      OR indexname LIKE 'idx_promotions_client_id' OR indexname LIKE 'idx_blog_posts_client_id';
   ```
   Confirmar: `clientId` nullable en las 4 tablas, existencia de `code`, `discountPercent`, `estimatedValue`, `assignedTo`, `dealStage`, `activityHistory`, y los 6 índices.
8. **Smoke tests del backend.**
   - `GET /api/health` → `200`.
   - Login y `GET` de productos/promociones/blog del CRM.
   - Crear/leer recursos globales (clientId NULL) como SUPER_ADMIN.
   - Verificar aislamiento multitenant (un tenant no ve recursos globales).
9. **Procedimiento de recuperación (rollback).**
   - **Preferido:** restaurar el backup si algo falla de forma irreversible.
   - **Datos:** esta migración no borra columnas; revertir requeriría recrear el estado anterior (`SET NOT NULL`, `DROP COLUMN`) — **no recomendado** y solo si es estrictamente necesario, ya que podría fallar si ya existen filas con `clientId NULL`.
   - Si se registró en `schema_migrations`, eliminar la fila correspondiente tras un rollback manual:
     ```sql
     DELETE FROM schema_migrations WHERE id = '20261110_01_samts_global_resources_and_crm_expansion.sql';
     ```

---

## 5. Conclusión
La migración `20261110_01` es **idempotente, transaccional, compatible con PostgreSQL 16 y no destructiva**. Está lista para ejecutarse de forma controlada siguiendo el procedimiento anterior. Queda pendiente, como acción operativa futura, la creación de `schema_migrations` para llevar registro de las migraciones aplicadas.

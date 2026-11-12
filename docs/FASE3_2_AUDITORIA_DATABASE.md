# FASE 3.2 — AUDITORÍA DE BASE DE DATOS Y MIGRACIONES

**Fecha:** 12 de noviembre de 2026
**Motor:** PostgreSQL · **ORM:** TypeORM 1.0.0 (instalado)
**Naturaleza:** Auditoría de solo lectura. **No se ejecutó ninguna migración ni consulta contra producción.** No se modificó el esquema.

---

## 1. ESTADO DE LA ESTRATEGIA DE MIGRACIONES

| Aspecto | Estado | Evidencia |
|---|---|---|
| Runner de migraciones TypeORM | ❌ **NO EXISTE** | `app.module.ts` usa `TypeOrmModule.forRoot` **sin** `migrations`, `migrationsRun` ni `DataSource` de CLI |
| Script de migración SQL manual | ✅ Presente | `src/database/migrations/20261110_01_samts_global_resources_and_crm_expansion.sql` |
| Directorio de migraciones | Solo 1 archivo | Único `.sql`; no hay mecanismo que lo ejecute automáticamente |
| Tabla de control (`migrations`) | ❌ No se usa | Sin registro de qué migraciones se aplicaron |
| Aplicación al arrancar contenedor | ⚠️ Riesgo | El `Dockerfile` ejecuta `node dist/main`; **no** corre migraciones |

**Implicación:** la actualización del esquema es **100 % manual**. Si el nuevo backend se despliega antes de aplicar el SQL, las consultas que usan las columnas nuevas fallarán con `column ... does not exist` (HTTP 500).

---

## 2. INVENTARIO DE ENTIDADES Y RELACIONES

| Entidad | Tabla | PK | Tenant | Relaciones |
|---|---|---|---|---|
| `BaseEntity` (abstracta) | — | `id uuid` + `createdAt`/`updatedAt` | — | — |
| `User` | `users` | uuid | `clientId` (nullable) | `ManyToOne → Client` (`onDelete: SET NULL`); `password` con `select: false` |
| `Client` | `clients` | uuid | — | raíz de tenants |
| `Product` | `products` | uuid | `clientId` (**nullable tras migración**) | `ManyToOne → Client` (`onDelete: CASCADE`, nullable) |
| `Promotion` | `promotions` | uuid | `clientId` (**nullable tras migración**) | `ManyToOne → Client`; campos `code`, `discountPercent` |
| `BlogPost` | `blog_posts` | uuid | `clientId` (**nullable tras migración**) | `ManyToOne → Client` |
| `AISettings` | `ai_settings` | uuid | `clientId` (**nullable tras migración**) | `OneToOne → Client` |
| `LeadMagnetLead` | `lead_magnet_leads` | uuid | **sin `clientId`** (global de SAMTS por diseño) | — |
| `Sale` / `SaleDetail` | `sales` / `sale_details` | uuid | `clientId` | `OneToMany` |
| `AIGeneration` | `ai_generations` | uuid | `clientId` | — |
| `Notification` | `notifications` | uuid | `clientId` | — |

**Coherencia entidad ↔ migración:** verificada. Los tipos declarados en las entidades coinciden con los `ALTER TABLE` del SQL:
- `products.clientId` → `uuid nullable` ✅ coincide con `DROP NOT NULL`.
- `promotions.code` → `varchar(50)`, `discountPercent` → `integer` ✅.
- `lead_magnet_leads.estimatedValue` → `decimal(12,2)`, `assignedTo` → `varchar(100)`, `dealStage` → `varchar(50)`, `activityHistory` → `jsonb default '[]'` ✅.

> **Nota de diseño:** `lead_magnet_leads` **no posee `clientId`**. El CRM es 100 % de SAMTS (SUPER_ADMIN). Esto es coherente con los guards (`@Roles(SUPER_ADMIN)`) y con el dashboard (que solo agrega leads cuando `clientId === null`). No es un defecto, es una decisión arquitectónica explícita.

---

## 3. ANÁLISIS DE LA MIGRACIÓN `20261110_01_samts_global_resources_and_crm_expansion.sql`

### 3.1 Qué cambia exactamente

| # | Sentencia | Efecto |
|---|---|---|
| 1 | `ALTER TABLE products ALTER COLUMN "clientId" DROP NOT NULL` | Permite productos globales de SAMTS (`clientId = NULL`) |
| 2 | `ALTER TABLE promotions ALTER COLUMN "clientId" DROP NOT NULL` | Idem promociones |
| 3 | `ALTER TABLE promotions ADD COLUMN IF NOT EXISTS code varchar(50)` | Campo cupón |
| 4 | `ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "discountPercent" integer` | Campo descuento |
| 5 | `ALTER TABLE blog_posts ALTER COLUMN "clientId" DROP NOT NULL` | Permite posts del blog oficial |
| 6 | `ALTER TABLE ai_settings ALTER COLUMN "clientId" DROP NOT NULL` | Permite config de IA global |
| 7 | `ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "estimatedValue" numeric(12,2) DEFAULT 0.00` | Valor de oportunidad |
| 8 | `... ADD COLUMN IF NOT EXISTS "assignedTo" varchar(100)` | Responsable comercial |
| 9 | `... ADD COLUMN IF NOT EXISTS "dealStage" varchar(50)` | Etapa de negocio |
| 10 | `... ADD COLUMN IF NOT EXISTS "activityHistory" jsonb DEFAULT '[]'::jsonb` | Historial de actividades |
| 11 | 6 × `CREATE INDEX IF NOT EXISTS` | `idx_leads_status`, `idx_leads_created_at`, `idx_leads_email`, `idx_products_client_id`, `idx_promotions_client_id`, `idx_blog_posts_client_id` |

### 3.2 Restricciones eliminadas / agregadas
- **Elimina:** la restricción `NOT NULL` sobre `clientId` en `products`, `promotions`, `blog_posts`, `ai_settings` (las FK a `clients` permanecen).
- **Agrega:** columnas nuevas (todas nullable o con default) e índices. **No agrega** nuevas restricciones `NOT NULL` ni `UNIQUE` → **no puede fallar** por datos existentes.

### 3.3 ¿Es idempotente?
**Sí, en su totalidad.**
- Los `ADD COLUMN IF NOT EXISTS` no fallan si la columna ya existe.
- Los `CREATE INDEX IF NOT EXISTS` no fallan si el índice ya existe.
- Los `ALTER COLUMN ... DROP NOT NULL` son idempotentes (aplicarlo dos veces es inocuo).
- Todo está envuelto en `BEGIN; … COMMIT;` → atómico: o se aplica completo o no se aplica nada.

### 3.4 ¿Puede ejecutarse sin perder registros?
**Sí.** Ninguna sentencia hace `DROP`, `TRUNCATE` ni cambia tipos que pudieran truncar datos:
- Quitar `NOT NULL` es una operación no destructiva.
- Añadir columnas nullable/con default no afecta filas existentes.
- Crear índices no altera datos (bloquea escritura brevemente; en tablas grandes usar `CREATE INDEX CONCURRENTLY` — ver §3.6).

### 3.5 ¿Existe estrategia de reversión?
**No hay un script de rollback versionado.** La reversión lógica sería:
```sql
BEGIN;
DROP INDEX IF EXISTS idx_blog_posts_client_id;
DROP INDEX IF EXISTS idx_promotions_client_id;
DROP INDEX IF EXISTS idx_products_client_id;
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_status;
ALTER TABLE lead_magnet_leads DROP COLUMN IF EXISTS "activityHistory";
ALTER TABLE lead_magnet_leads DROP COLUMN IF EXISTS "dealStage";
ALTER TABLE lead_magnet_leads DROP COLUMN IF EXISTS "assignedTo";
ALTER TABLE lead_magnet_leads DROP COLUMN IF EXISTS "estimatedValue";
ALTER TABLE promotions DROP COLUMN IF EXISTS "discountPercent";
ALTER TABLE promotions DROP COLUMN IF EXISTS code;
-- Solo si NO existen filas con clientId NULL:
-- ALTER TABLE products  ALTER COLUMN "clientId" SET NOT NULL;
-- ALTER TABLE promotions ALTER COLUMN "clientId" SET NOT NULL;
-- ALTER TABLE blog_posts ALTER COLUMN "clientId" SET NOT NULL;
-- ALTER TABLE ai_settings ALTER COLUMN "clientId" SET NOT NULL;
COMMIT;
```
⚠️ **Advertencia:** no restaurar el `NOT NULL` si SAMTS ya creó recursos con `clientId = NULL` (fallaría). El rollback es seguro a nivel columnas, pero la parte de `NOT NULL` requiere verificación previa.

### 3.6 Buenas prácticas antes de producción
1. **Backup completo** (`pg_dump`) antes de aplicar.
2. Considerar `CREATE INDEX CONCURRENTLY` (fuera de transacción) si las tablas tienen volumen alto, para evitar lock de escritura. La versión actual usa `CREATE INDEX` dentro de `BEGIN/COMMIT`.
3. Ejecutar en ventana de mantenimiento o con tráfico bajo.
4. Registrar la migración en una tabla de control (recomendado implementar runner, ver §5).

---

## 4. RIESGO CRÍTICO RELACIONADO CON `synchronize`

**Ubicación:** [app.module.ts](file:///home/profe/SAMTS/SAMTS-BACKEND/src/app.module.ts#L25-L34)

```typescript
synchronize: process.env.NODE_ENV !== 'production',
```

- Si `NODE_ENV` **es** `production` → `synchronize = false` → el esquema solo cambia con el SQL manual (correcto).
- Si `NODE_ENV` **no está definido** en el contenedor de producción → `synchronize = true` → **TypeORM intentará alinear el esquema automáticamente en cada arranque**, con riesgo de:
  - alteraciones no deseadas,
  - conflictos con el SQL manual,
  - pérdida de datos en escenarios de cambio de tipo.
- **Acción requerida (bloqueante de configuración):** garantizar `NODE_ENV=production` en el entorno de producción y verificar que el valor sea exactamente `production`.

---

## 5. PROPUESTA DE SECUENCIA DE MIGRACIÓN PARA PUBLICACIÓN (no ejecutada)

> ⚠️ Está prohibido ejecutar migraciones en esta fase. La siguiente secuencia es una **propuesta** para la futura publicación.

**Verificaciones previas (baseline):**
1. `SELECT version();` — confirmar motor y versión.
2. Verificar existencia de tablas y columnas objetivo:
   ```sql
   \d products
   \d promotions
   \d blog_posts
   \d ai_settings
   \d lead_magnet_leads
   ```
3. Verificar que las columnas nuevas **no** existen ya:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name='lead_magnet_leads'
     AND column_name IN ('estimatedValue','assignedTo','dealStage','activityHistory');
   ```
4. `SELECT count(*) FROM products WHERE "clientId" IS NULL;` (debe dar 0 antes; informativo).
5. **Backup:** `pg_dump --format=custom <DB> > backup_pre_fase3_2.dump`.

**Aplicación:**
6. Ejecutar `20261110_01_samts_global_resources_and_crm_expansion.sql` con un usuario con permisos `ALTER`/`CREATE INDEX`.
7. Confirmar `COMMIT` sin errores.

**Verificaciones posteriores:**
8. Re-ejecutar las consultas del paso 3 → las 4 columnas deben existir.
9. `\d promotions` → confirmar `code`, `discountPercent`.
10. Consultar índices:
    ```sql
    SELECT indexname FROM pg_indexes WHERE tablename IN
      ('products','promotions','blog_posts','lead_magnet_leads');
    ```
11. `SELECT count(*) FROM lead_magnet_leads;` → sin pérdida de registros vs. baseline.
12. Prueba funcional: crear un producto global (`clientId = NULL`) y verificar aislamiento con un `CLIENT_ADMIN`.

**Compatibilidad hacia atrás:** el SQL es **aditivo y no destructivo**, por tanto el backend *anterior* sigue funcionando tras aplicarlo (ignora columnas nuevas). Sin embargo, el backend *nuevo* **requiere** el SQL aplicado antes de arrancar.

**Recomendación de gobernanza:** a mediano plazo, incorporar un runner de migraciones real (TypeORM `DataSource` + `migrationsRun` o herramienta equivalente) y convertir este archivo en una migración versionada con tabla de control.

---

## 6. CONCLUSIONES DE BASE DE DATOS

| Dimensión | Clasificación |
|---|---|
| Coherencia entidad ↔ esquema | **APROBADO** |
| Idempotencia de la migración | **APROBADO** (idempotente y atómica) |
| Seguridad de datos de la migración | **APROBADO** (no destructiva) |
| Rollback versionado | **NO VERIFICADO / AUSENTE** (reversión manual documentada) |
| Runner de migraciones | **BLOQUEANTE** (aplicación manual; sin control de estado) |
| Riesgo `synchronize` | **BLOQUEANTE DE CONFIGURACIÓN** (`NODE_ENV` debe ser `production`) |
| Verificación contra BD de producción | **NO VERIFICADO** (entorno no disponible) |

**Conclusión:** el esquema y la migración son técnicamente sólidos e idempotentes, pero **la publicación depende de una operación manual no automatizada** y de garantizar `NODE_ENV=production`. Esto se clasifica como **bloqueante operativo**, no como defecto de código.

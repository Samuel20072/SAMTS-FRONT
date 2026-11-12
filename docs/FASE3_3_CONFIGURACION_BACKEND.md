# FASE 3.3 — CONFIGURACIÓN DEL BACKEND

**Repositorio:** `~/SAMTS/SAMTS-BACKEND` (rama `feat/admin-operations-hub`)
**Fecha:** 2026-11-12

---

## 1. Objetivo
Eliminar configuraciones silenciosas capaces de alterar el esquema de la base de datos y endurecer la configuración de arranque (TypeORM, JWT, Swagger, CORS).

---

## 2. `NODE_ENV` y `synchronize` (TypeORM)

### Hallazgo
```ts
synchronize: process.env.NODE_ENV !== 'production'
```
Configuración **fail-open**: si `NODE_ENV` no estaba definido (error común en despliegues), `synchronize` quedaba activo y TypeORM podía alterar el esquema en producción.

### Solución implementada
Nuevo archivo `src/shared/config/database.config.ts`:

```ts
export function resolveSynchronize(env = process.env): boolean {
  // Fail-safe: solo development / test habilitan synchronize.
  return isDevLikeEnvironment(env.NODE_ENV);
}
```

- `synchronize === true` **únicamente** si `NODE_ENV` es exactamente `development` o `test`.
- Cualquier otro valor — `production`, `prod`, `staging`, mayúsculas/espacios, **o `NODE_ENV` ausente** — deja `synchronize === false`.
- En producción se exige el uso de **migraciones versionadas** (no hay sincronización automática de esquema).

### Validación antes de inicializar TypeORM
`validateTypeOrmConfig(env)` se ejecuta en la `useFactory` de `TypeOrmModule.forRootAsync` (es decir, **antes** de crear la conexión) y valida:

1. Invariante crítico: `synchronize` no puede estar activo en un entorno de producción.
2. `DATABASE_URL` debe estar definida.

Si la validación falla, el backend **no arranca**.

### Cambio en `app.module.ts`
Se reemplazó `TypeOrmModule.forRoot({...})` por `TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory })`, aplicando `validateTypeOrmConfig(process.env)` y `resolveSynchronize(process.env)`.

### Comportamiento por entorno (verificado con pruebas)

| `NODE_ENV` | `synchronize` | Resultado |
|---|---|---|
| `development` | `true` | Esquema gestionado automáticamente (local) |
| `test` | `true` | Requerido para pruebas con BD efímera |
| `production` | `false` | Migraciones versionadas obligatorias |
| `staging` | `false` | Migraciones versionadas obligatorias |
| **ausente** | **`false`** | Fail-safe (antes era `true`) |

### Pruebas
`src/shared/config/database.config.spec.ts` — verifica `resolveSynchronize`, los helpers de entorno y `validateTypeOrmConfig`. **Ninguna prueba ejecuta migraciones ni toca una base de datos real.**

### Nota sobre Jest
Jest define `NODE_ENV=test` automáticamente; los tests e2e conservan el comportamiento previo (`synchronize=true`) sin cambios.

---

## 3. Endurecimiento de `JWT_SECRET`
Detallado en `FASE3_3_REMEDIACION_SEGURIDAD.md`. Resumen:
- Se eliminó el valor por defecto público.
- `resolveJwtSecret()` falla explícitamente si el secreto no está definido.
- Fuera de dev/test: se rechazan valores inseguros conocidos y se exige longitud ≥ 32.
- Los mensajes de error no exponen el valor del secreto.

---

## 4. Swagger (`/docs`) por entorno

### Hallazgo
`SwaggerModule.setup('docs', ...)` se ejecutaba siempre, exponiendo la documentación completa de la API públicamente en producción.

### Solución implementada (`main.ts`)
```ts
const isProduction = process.env.NODE_ENV === 'production';
const swaggerEnabled = !isProduction || process.env.ENABLE_SWAGGER === 'true';

if (swaggerEnabled) {
  // DocumentBuilder + SwaggerModule.setup('docs', ...)
}
```

- **Desarrollo / no-productivo:** `/docs` disponible (documentación útil).
- **Producción:** `/docs` **deshabilitado** por defecto. Solo se habilita con `ENABLE_SWAGGER=true` (y se recomienda restringirlo a nivel de red/gateway o con autenticación básica si debe permanecer).
- No se modificaron dominios ni configuraciones de producción.

---

## 5. Revisión de seguridad adicional (sin cambios de producción)

| Elemento | Estado observado | Observación |
|---|---|---|
| **CORS** (`main.ts`) | Lista blanca explícita: `samts.app`, `www.samts.app`, `localhost:4200/4000/3000/3001`, `127.0.0.1`; permite peticiones sin `Origin` (SSR/móvil/curl) | Correcto. `credentials: true` con lista blanca explícita. |
| **ALLOWED_HOSTS** (frontend SSR) | Configurado en el servidor SSR | Fuera del alcance de backend; sin cambios. |
| **Validación de tenant** | Resuelta por `@CurrentUser()` + token; nunca por el body en operaciones rutinarias | Ver §3 de `FASE3_3_REMEDIACION_SEGURIDAD.md`. `POST /sales` valida contra BD. |
| **Guards** | `JwtAuthGuard` + `RolesGuard` aplicados a controladores administrativos | `UsersController` ahora con guards explícitos. |
| **Roles** | `@Roles(...)` por endpoint | Revisados en usuarios, ventas, recursos. |
| **Endpoints administrativos** | CRM, Dashboard, Productos, Promociones, Blog, IA | Protegidos por guard global de módulo o por controlador. |

No se modificaron dominios ni configuraciones de producción.

---

## 6. Archivos afectados
**Modificados:** `app.module.ts`, `main.ts`, `auth.module.ts`, `jwt.strategy.ts`
**Nuevos:** `src/shared/config/database.config.ts`, `database.config.spec.ts`

## 7. Acciones operativas recomendadas (no ejecutadas)
- Definir `NODE_ENV=production` en Dokploy.
- Definir `JWT_SECRET` seguro (mín. 32 caracteres aleatorios).
- No definir `ENABLE_SWAGGER` (o dejarlo en `false`) en producción.
- Confirmar `DB_SSL` según el proveedor de PostgreSQL gestionado.

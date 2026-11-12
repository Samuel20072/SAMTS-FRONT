# FASE 3.3 — REMEDIACIÓN DE SEGURIDAD

**Repositorios:** `~/SAMTS/SAMTS-BACKEND` (rama `feat/admin-operations-hub`)
**Fecha:** 2026-11-12
**Alcance:** Corrección de los hallazgos de seguridad identificados en la auditoría Fase 3.2.

---

## 1. Resumen ejecutivo

| Hallazgo | Estado | Evidencia |
|---|---|---|
| `/api/users` permitía crear administradores sin autenticación | **Corregido** (conservado de Fase 3.2, ahora verificado con prueba) | `users.controller.ts` + `users.controller.security.spec.ts` |
| `POST /api/sales` usaba el identificador ficticio `super-admin-global` | **Corregido** | `sales.controller.ts`, `sales.service.ts`, `create-sale.dto.ts` + 2 specs |
| `JWT_SECRET` con valor por defecto público e inseguro | **Corregido** | `jwt.config.ts`, `auth.module.ts`, `jwt.strategy.ts` + spec |

No se realizó `git push`, merge ni despliegue. Todos los cambios permanecen en `feat/admin-operations-hub`.

---

## 2. `/api/users` — creación anónima de administradores

### Hallazgo (Fase 3.2)
`UsersController` no declaraba guards; cualquier cliente anónimo podía invocar `POST /api/users` y crear usuarios con rol elevado.

### Corrección (conservada e inspeccionada)
El archivo `src/features/users/infrastructure/controllers/users.controller.ts` quedó modificado pero **sin commit** al final de la Fase 3.2. En esta fase se inspeccionó y se preservó íntegramente:

```ts
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('users')
export class UsersController { ... }
```

- `@UseGuards(JwtAuthGuard, RolesGuard)` a nivel de controlador → toda la ruta exige JWT válido y rol.
- `@Roles(UserRole.SUPER_ADMIN)` → solo el super administrador.

### Prueba de regresión
`src/features/users/infrastructure/controllers/users.controller.security.spec.ts` valida que no exista acceso anónimo y que el rol requerido sea `SUPER_ADMIN`.

---

## 3. `POST /api/sales` — eliminación del identificador ficticio

### Hallazgo
El controlador creaba ventas con:

```ts
const clientId = user.clientId || 'super-admin-global';
```

`'super-admin-global'` no es un UUID y no existe en la tabla `clients`. Además, `sales.clientId` es **NOT NULL con FK a `clients`** (`onDelete: CASCADE`), por lo que **no existen ventas globales**: toda venta pertenece a un tenant real.

### Investigación realizada
- **Controller** (`sales.controller.ts`): resolución del tenant.
- **Service** (`sales.service.ts`): creación transaccional, stock, notificación.
- **Entity `Sale`**: `clientId` NOT NULL + FK a `Client`.
- **DTO** (`create-sale.dto.ts`): validación de entrada.
- **Permisos**: `@Roles(SUPER_ADMIN, CLIENT_ADMIN, EMPLOYEE)`.
- **Dashboard**: `totalRevenue` se calcula sobre la tabla `Sale` filtrando por `clientId`.

### Solución implementada

**1. DTO** (`create-sale.dto.ts`) — nuevo campo opcional y validado:

```ts
@ApiPropertyOptional({ ... })
@IsOptional()
@IsUUID()
clientId?: string;
```

**2. Controller** (`sales.controller.ts`) — resolución segura del tenant:

- `SUPER_ADMIN`: **debe** indicar un `clientId` (UUID). Si no lo hace → `400 Bad Request`. No se asigna ninguna venta a recursos globales.
- `CLIENT_ADMIN` / `EMPLOYEE`: se fuerza el `clientId` del token. Si envían otro tenant → `403 Forbidden`. Sin `clientId` en el token → `403 Forbidden`.

**3. Service** (`sales.service.ts`) — validación contra la base de datos:

```ts
const client = await clientRepo.findOne({ where: { id: clientId } });
if (!client) {
  throw new BadRequestException(`Client with ID ${clientId} not found`);
}
```

Esto impide cualquier identificador ficticio o inexistente antes de crear la venta (dentro de la transacción, con rollback automático).

### Reglas de negocio garantizadas
- Nunca se usan strings ficticios como identificadores de tenant.
- No se asignan automáticamente ventas de clientes a recursos globales.
- El frontend **no** puede determinar libremente el tenant de la operación: el backend lo valida contra el token (usuarios de tenant) y contra la BD (super admin).
- No se introdujeron relaciones ambiguas ni cambios de esquema.

### Pruebas de regresión
- `sales.controller.spec.ts` (6 casos): SUPER_ADMIN sin clientId → 400; SUPER_ADMIN con UUID → se propaga; nunca se pasa `'super-admin-global'` ni un valor no-UUID (validado por regex UUID); usuario de tenant usa su token; usuario de tenant con otro tenant → 403; empleado sin clientId → 403.
- `sales.service.spec.ts` (4 casos): rechazo de cliente inexistente (rollback); rechazo de clientId ficticio; rechazo de producto de otro tenant; alta válida con commit.

---

## 4. Hardening de `JWT_SECRET`

### Hallazgo
`auth.module.ts` y `jwt.strategy.ts` usaban:

```ts
configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production'
```

Un valor por defecto público conocido: cualquiera podía firmar tokens válidos.

### Solución implementada

**`src/shared/config/jwt.config.ts`** (nuevo):

- `resolveJwtSecret(env)`: **obligatorio**. Si `JWT_SECRET` no está definido (o está vacío) lanza un `Error` explícito → el backend **no arranca** sin secreto.
- Fuera de `development`/`test`:
  - Rechaza valores inseguros conocidos (`super-secret-key-change-in-production`, `changeme`, `change-me`, `secret`, `jwt-secret`).
  - Exige longitud mínima de **32 caracteres** (`MIN_JWT_SECRET_LENGTH`).
- Los mensajes de error **nunca** incluyen el valor del secreto.
- `resolveJwtExpiresIn(env)`: duración configurable vía `JWT_EXPIRES_IN`, por defecto `1d` (tipo `StringValue`).

**`auth.module.ts`**: `JwtModule.registerAsync` ahora usa `resolveJwtSecret()` / `resolveJwtExpiresIn()`. Se eliminó el fallback y la dependencia de `ConfigService` para el secreto.

**`jwt.strategy.ts`**: `secretOrKey: resolveJwtSecret()`. Se eliminó `ConfigService` y el fallback.

Se revisaron **todos** los usos de JWT: `AuthService` (firma de access tokens), `JwtStrategy` (validación passport-jwt) y `JwtModule` (firma). No existen refresh tokens en el proyecto actual.

### Condiciones para configurar un secreto seguro en producción
1. `JWT_SECRET` **debe estar definida** en el entorno (Dokploy / variables secretas). Sin ella el backend falla al arrancar (fail-fast intencional).
2. Valor **aleatorio**, de al menos 32 caracteres, generado p. ej. con `openssl rand -base64 48`.
3. **No** reutilizar el valor de `.env` de desarrollo (`super-secret-key-change-in-production`); en producción será rechazado.
4. **No** imprimir el secreto en logs ni versionarlo en el repositorio.
5. Al rotar el secreto, todos los tokens emitidos quedan invalidados (los usuarios deben reautenticarse).

### Pruebas
`src/shared/config/jwt.config.spec.ts` (10 casos): error sin secreto; error con vacío; el mensaje no contiene el valor; rechazo de secretos inseguros conocidos; rechazo por longitud; aceptación de secreto válido; permitir valores cortos solo en dev/test; reglas estrictas cuando `NODE_ENV` no está definido; valor por defecto y valor configurado de expiración.

---

## 5. Archivos afectados

**Modificados:** `users.controller.ts`, `sales.controller.ts`, `sales.service.ts`, `create-sale.dto.ts`, `auth.module.ts`, `jwt.strategy.ts`
**Nuevos:** `src/shared/config/jwt.config.ts`, `jwt.config.spec.ts`, `sales.controller.spec.ts`, `sales.service.spec.ts`, `users.controller.security.spec.ts`

## 6. Pendientes / riesgos residuales
- La **rotación de `JWT_SECRET`** en el entorno de producción es una acción operativa (no ejecutada en esta fase; no se debe tocar producción).
- Existen otros secretos en `.env` (p. ej. `RESEND_API_KEY`) que son datos de entorno; se recomienda verificar que `.env` esté en `.gitignore` y que los valores productivos vivan solo en el gestor de secretos de Dokploy.

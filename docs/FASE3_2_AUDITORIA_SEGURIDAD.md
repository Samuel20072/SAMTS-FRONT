# FASE 3.2 — AUDITORÍA DE SEGURIDAD Y ARQUITECTURA

**Fecha:** 12 de noviembre de 2026
**Rama auditada:** `feat/admin-operations-hub` (backend `855fbdc`, frontend `adb83e7`)
**Método:** revisión estática de código (guards, interceptores, consultas y filtros de tenant). No se ejecutaron ataques contra un entorno vivo (la base de datos de SAMTS no estaba en ejecución).

---

## 1. AUTENTICACIÓN

| Aspecto | Estado | Evidencia |
|---|---|---|
| Emisión de JWT | ✅ | `auth.service.ts` firma `{ sub, email, role, clientId }` |
| Validación de JWT | ✅ | `jwt.strategy.ts` (`ignoreExpiration: false`) |
| Hash de contraseñas | ✅ | `bcrypt` (salt 10) |
| Escritura de JWT (auto-registro) | ✅ | `auth.service.ts:53` (transacción atómica) |
| Secret JWT | ⚠️ **RIESGO** | Default inseguro `'super-secret-key-change-in-production'` si la env var falta (`jwt.strategy.ts:12`) |
| Expiración del token | ⚠️ Observación | No se declara `expiresIn` explícito al firmar; depende del módulo JWT |

---

## 2. AUTORIZACIÓN Y PROTECCIÓN DE ENDPOINTS

### 2.1 Hallazgo crítico (CORREGIDO)
`UsersController` (`/api/users`) **no tenía guards ni decorador de roles**, y no existe `APP_GUARD` global. Admitía creación anónima de usuarios con rol `SUPER_ADMIN`. **Corregido** en esta fase: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.SUPER_ADMIN)` a nivel de clase, con pruebas de regresión.

### 2.2 Mapa de protección por controlador (tras la corrección)

| Controlador | Guards | Roles | Comentario |
|---|---|---|---|
| `auth` | — | — | Público por diseño (login/register) |
| `users` | ✅ Jwt+Roles | SUPER_ADMIN | **Corregido en Fase 3.2** |
| `clients` | ✅ (por método) | SUPER_ADMIN / CLIENT_ADMIN | `me` protegido |
| `products` | ✅ clase | SA/CA/EM (delete: SA/CA) | OK |
| `promotions` | ✅ clase | SA/CA/EM (delete: SA/CA) | OK |
| `blog-posts` | ✅ clase | SA/CA/EM (delete: SA/CA) | OK |
| `blog-posts/public` | — | — | Público (solo `PUBLISHED`) |
| `ai-settings` | ✅ clase | SA/CA/EM | OK |
| `ai` (generación) | ✅ clase | SA/CA/EM | OK |
| `dashboard` | ✅ clase | cualquiera autenticado | aislamiento por tenant |
| `notifications` | ✅ clase | cualquiera autenticado | OK |
| `sales` | ✅ clase | SA/CA/EM | ver §2.4 |
| `lead-magnet` | ✅ en endpoints admin | SUPER_ADMIN | OK |
| `app` (`GET /`) | — | — | "Hello" — considerar health check |

### 2.3 Validación de entrada
- `ValidationPipe` global con `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true` (`main.ts:54`). ✅
- DTOs con `class-validator` en los módulos comerciales. ✅

### 2.4 Hallazgo medio — `POST /api/sales` con identificador ficticio
`sales.controller.ts:28` usa `user.clientId || 'super-admin-global'`. Contradice la afirmación de la Fase 3.1 ("no se utiliza ningún UUID ficticio") y provocaría un error de tipo al insertar en la FK `uuid`. **Documentado, no corregido** (requiere decisión de producto: ¿SAMTS vende directamente? ¿debe `create` aceptar `tenantId`?).

---

## 3. MULTITENANCY

Modelo híbrido: recursos globales de SAMTS con `clientId = NULL` (solo `SUPER_ADMIN`) y recursos de cliente con `clientId = UUID`.

### 3.1 Aislamiento verificado por módulo

| Módulo | Listado | Detalle/Update/Delete | Filtro de tenant |
|---|---|---|---|
| Products | `IsNull()`/tenant | `if (clientId && product.clientId !== clientId) → 403` | ✅ |
| Promotions | `IsNull()`/tenant | idem | ✅ |
| Blog | `IsNull()`/tenant | idem | ✅ |
| AISettings | `IsNull()`/tenant | `findByClientId` | ✅ |
| Dashboard | `clientId === null` ⇒ leads SAMTS; tenant ⇒ `[]` | — | ✅ |
| Leads | `@Roles(SUPER_ADMIN)` | `@Roles(SUPER_ADMIN)` | ✅ |
| Sales | `where.clientId` | `if (clientId && …)` | ✅ (con matiz 2.4) |

### 3.2 Observaciones de hardening
1. **Verificación por "verdad" de `clientId`.** En los métodos `findById/update/delete` la comprobación es `if (clientId && recurso.clientId !== clientId)`. Si un usuario no-`SUPER_ADMIN` tuviera `clientId` nulo, la verificación se omite y podría acceder/editar recursos globales de SAMTS. Hoy todos los usuarios no-super tienen `clientId`, pero conviene cambiar a una comprobación explícita (`user.role !== SUPER_ADMIN && !user.clientId → 403`) en cada endpoint. **Documentado.**
2. **`tenantId` por query param.** Solo se honra para `SUPER_ADMIN`; para el resto se fuerza el `clientId` del token. Correcto. Un `tenantId` inexistente simplemente devuelve vacío (no hay fuga).
3. **Blog público enumerable.** `GET /blog-posts/public?clientId=<uuid>` permite listar los posts publicados de cualquier tenant. Riesgo bajo (contenido público por diseño).

---

## 4. EXPOSICIÓN DE INFORMACIÓN SENSIBLE

| Ítem | Estado |
|---|---|
| `password` en respuestas de usuario | ✅ Excluido (`UserResponseDto`) |
| Swagger público en `/docs` | ⚠️ Recomendado deshabilitar en producción |
| Logs con datos personales (email/WhatsApp) | ⚠️ `lead-magnet.service.ts` loguea email y notas; considerar nivel en producción |
| `console.log` con secretos | ✅ No detectado |

---

## 5. CONFIGURACIÓN CORS

`main.ts:13-51`: allowlist de orígenes (`samts.app`, `www.samts.app`, varios `localhost`) + permiso a cualquier `http://localhost:*`. `credentials: true`. Métodos y cabeceras explícitos.
- ✅ Frontend de producción (`https://samts.app`) permitido.
- ⚠️ Cualquier otro dominio de producción requeriría añadirse; verificar la URL real del panel admin.

---

## 6. CONCLUSIONES DE SEGURIDAD

- **Corregido:** escalada de privilegios vía `/api/users` (crítico).
- **Bloqueantes de configuración (no de código):** secret JWT por defecto, Swagger expuesto, CORS limitado al dominio actual.
- **Deuda de hardening:** verificación de tenant por valor explícito, identificador ficticio en `sales`, `expiresIn` de JWT.
- La afirmación de la Fase 3.1 ("Seguridad Multitenant APROBADO") era **incompleta**: no cubría el módulo `users` ni el endpoint de creación de usuarios.

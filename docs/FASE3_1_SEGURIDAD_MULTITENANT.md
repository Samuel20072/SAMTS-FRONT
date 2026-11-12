# FASE 3.1 — Seguridad y Arquitectura Multitenant

**Auditoría de Aislamiento:** Recursos Globales SAMTS vs. Recursos de Clientes SaaS  
**Roles Evaluados:** `SUPER_ADMIN`, `CLIENT_ADMIN`, `EMPLOYEE`

---

## 1. Estrategia de Multitenancy Implementada

SAMTS opera bajo un modelo de multitenancy híbrido y explícito:

1. **Recursos Globales de SAMTS (`clientId = null`):**
   - Son propiedad exclusiva de la agencia SAMTS (Servicios comerciales, promociones globales de SAMTS, artículos del blog institucional, configuración del agente Samuel AI y prospectos comerciales).
   - Solo pueden ser gestionados y visualizados por usuarios con rol `SUPER_ADMIN`.
   - `clientId = null` **NO significa acceso público**. Requiere explícitamente `UserRole.SUPER_ADMIN`.

2. **Recursos de Clientes SaaS (`clientId = UUID`):**
   - Son propiedad de cada tenant suscrito a la plataforma (restaurantes, tiendas, pymes).
   - Sus usuarios (`CLIENT_ADMIN`, `EMPLOYEE`) están restringidos forzosamente a su propio `clientId`.

---

## 2. Pruebas de Intrusión y Fuga de Datos (Penetration Test Local)

Para la prueba se creó un tenant real:
- **Tenant:** `Restaurante Gourmet La Casona` (`clientId = d605c76d-7ac4-4e82-9826-3e044b183ebe`)
- **Usuario:** Mariana López (`CLIENT_ADMIN`) con token JWT firmado oficialmente.

### Resultados de Intentos de Acceso no Autorizado

| Recurso Auditado | Endpoint Probado | Comportamiento Esperado | Resultado Real | Estado |
|---|---|---|---|---|
| **Productos Globales SAMTS** | `GET /api/products` | No ver productos de SAMTS | `total: 0`, `data: []` | 🔒 BLOQUEADO |
| **Promociones Globales SAMTS** | `GET /api/promotions` | No ver promociones de SAMTS | `total: 0`, `data: []` | 🔒 BLOQUEADO |
| **Blog Global SAMTS** | `GET /api/blog-posts` | No ver artículos de SAMTS | `total: 0`, `data: []` | 🔒 BLOQUEADO |
| **AI Settings de SAMTS** | `GET /api/ai-settings` | No ver ni alterar tono de SAMTS | Retorna AI Settings propio del tenant | 🔒 AISLADO |
| **Leads Comerciales SAMTS** | `GET /api/lead-magnet/leads` | Denegar acceso total | **403 Forbidden** (`Forbidden resource`) | 🔒 BLOQUEADO |
| **Dashboard de SAMTS** | `GET /api/dashboard` | No ver prospectos de SAMTS | `totalLeads: 0`, `recentLeads: []` | 🔒 AISLADO |
| **Modificación de Recursos Ajenos** | `PUT /api/products/:id` | Rechazar si no pertenece al tenant | 404 / 403 según aislamiento TypeORM | 🔒 BLOQUEADO |

---

## 3. Comprobación de Identificadores

- **Sin UUID Ficticios:** No se utiliza ningún UUID simulado o estático tipo `super-admin-global` o `00000000-0000-0000-0000-000000000000`.
- **Uso de `IsNull()` en TypeORM:** Todas las consultas de recursos globales usan `IsNull()` de TypeORM explícitamente en el repositorio.
- **Acceso Cruzado por Parámetro (`?tenantId=`):** Solo permitido a usuarios con rol `SUPER_ADMIN`. Si un usuario que no es `SUPER_ADMIN` intenta enviar `?tenantId=otro-uuid`, el backend ignora el query parameter y fuerza el `clientId` extraído de su token JWT.

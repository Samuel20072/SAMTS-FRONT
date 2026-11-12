# FASE 3.4 — Prueba del Health Check

**Repositorio:** `~/SAMTS/SAMTS-BACKEND`
**Rama:** `feat/admin-operations-hub`
**Fecha:** 2026-11-12
**Endpoint:** `GET /api/health` (sin autenticación)

---

## 1. Implementación

`src/features/health/` expone `GET /api/health` que ejecuta `SELECT 1` contra PostgreSQL
(consulta trivial, sin JOINs ni agregaciones) y responde según el resultado. Es público
(no usa `JwtAuthGuard`) y no expone datos sensibles ni de negocio.

## 2. Escenarios verificados

| Escenario | HTTP | Cuerpo |
|---|---|---|
| Base de datos **disponible** | **200** | `{"status":"ok","checks":{"database":"up"},"timestamp":"2026-11-12T14:39:56.641Z"}` |
| Base de datos **no disponible** | **503** | `{"status":"error","checks":{"database":"down"},"timestamp":"..."}` |
| Recuperación tras reiniciar la BD | 200 | vuelve a `database:"up"` |
| Sin autenticación | ✅ | responde sin `Authorization` |
| Sin información sensible | ✅ | sólo `status`, `checks.database`, `timestamp` |

## 3. Formato JSON exacto

```json
// 200 OK — BD operativa
{
  "status": "ok",
  "checks": { "database": "up" },
  "timestamp": "2026-11-12T14:39:56.641Z"
}
```

```json
// 503 Service Unavailable — BD caída
{
  "status": "error",
  "checks": { "database": "down" },
  "timestamp": "2026-11-12T14:39:56.641Z"
}
```

- `status`: `"ok"` | `"error"`.
- `checks.database`: `"up"` | `"down"`.
- `timestamp`: ISO 8601 UTC.

## 4. Configuración recomendada para Dokploy

- **Ruta de health check:** `/api/health`
- **Método:** `GET`
- **Código esperado (healthy):** `200`
- **Código unhealthy:** `503`
- **Intervalo sugerido:** 30 s · **Timeout:** 5 s · **Retries:** 3
- **Start period:** ~30–60 s (permitir `synchronize`/migración y conexión a BD)
- **Puerto interno:** el definido por `PORT` (3000 por defecto)

El código `503` con `checks.database = "down"` permite que Dokploy **no** enrute tráfico al
contenedor mientras la base de datos no esté lista (readiness real, no sólo liveness).

## 5. Conclusión

`GET /api/health` funciona como **readiness probe** con verificación real de PostgreSQL:
`200` cuando la BD responde y `503` cuando no, sin autenticación, sin datos sensibles y sin
consultas pesadas. Configuración lista para Dokploy.

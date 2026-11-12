# FASE 3.3 — HEALTH CHECK

**Repositorio:** `~/SAMTS/SAMTS-BACKEND`
**Endpoint:** `GET /api/health`

---

## 1. Objetivo
Dotar al backend de un endpoint de salud que permita a Dokploy (u orquestadores) comprobar que la aplicación está operativa, incluyendo una verificación **real** de la conectividad con PostgreSQL.

---

## 2. Implementación

**Archivos nuevos:**
- `src/features/health/health.controller.ts`
- `src/features/health/health.module.ts`
- `src/features/health/health.controller.spec.ts`

**Registro:** `HealthModule` se importa en `AppModule`.

`main.ts` aplica el prefijo global `api`, por lo que la ruta efectiva es **`GET /api/health`**.

---

## 3. Comportamiento

### Servicio saludable (200)
```json
{
  "status": "ok",
  "checks": { "database": "up" },
  "timestamp": "2026-11-12T14:00:00.000Z"
}
```

### Dependencia obligatoria no disponible (503)
```json
{
  "status": "error",
  "checks": { "database": "down" },
  "timestamp": "2026-11-12T14:00:00.000Z"
}
```
Se lanza mediante `ServiceUnavailableException` (HTTP 503).

---

## 4. Características verificadas

| Requisito | Cumplimiento |
|---|---|
| HTTP 200 cuando el servicio está saludable | Sí |
| Verificación real de conectividad a PostgreSQL | Sí — `dataSource.query('SELECT 1')` |
| HTTP 503 cuando una dependencia obligatoria falla | Sí — `ServiceUnavailableException` |
| No expone credenciales ni información interna | Sí — la respuesta no incluye el error; los detalles se descartan en el `catch` |
| No requiere autenticación para la comprobación básica | Sí — sin guards en el controlador |
| Respuesta JSON pequeña y estable | Sí — 3 claves de nivel superior |
| Evita consultas pesadas | Sí — `SELECT 1` (consulta mínima) |

**Liveness vs readiness:** se implementó una comprobación única y sencilla que cubre ambos propósitos (proceso vivo + dependencia lista). No se añadieron endpoints separados para mantener la implementación simple, según lo permitido por el requerimiento.

---

## 5. Pruebas

`health.controller.spec.ts` (unitarias, con `DataSource` mockeado vía `getDataSourceToken()`):

1. `database` responde → `status: 'ok'`, `checks.database === 'up'`, se invoca `SELECT 1`.
2. `database` falla → lanza `ServiceUnavailableException` (503).
3. La respuesta 503 **no** contiene detalles internos (se verifica que el JSON serializado no incluya `password`, `postgres` ni el mensaje del error de conexión).

**Pruebas de integración:** no ejecutables en el entorno actual (no hay PostgreSQL disponible en `localhost:5433`). Ver `FASE3_3_QA.md`.

---

## 6. Uso recomendado en Dokploy
- **Health check path:** `/api/health`
- **Esperado:** `200`
- No requiere cabeceras de autenticación.
- No crear ni modificar despliegues en Dokploy en esta fase.

# FASE 3 — Pendientes y Mejoras Futuras

## Estado del proyecto: COMPLETADO ✅

Las siguientes son mejoras opcionales que NO bloquean la operación del panel.

---

## Prioridad ALTA (funcionalidad)

### 1. Paginación real en leads
**Situación:** El backend no expone paginación en `/lead-magnet/leads`. El frontend carga todos los leads y filtra en cliente.
**Impacto:** Con más de 500 leads puede haber lentitud.
**Propuesta:** Agregar `?page=1&limit=50` en el controlador y `Content-Range` en headers.

### 2. Websocket / actualización en tiempo real
**Situación:** El dashboard requiere refresh manual para ver nuevos leads.
**Propuesta:** Implementar Socket.io en backend + `fromEvent()` en Angular para push de eventos `lead.created`.

### 3. Búsqueda full-text en leads
**Situación:** Búsqueda actual es client-side sobre array en memoria.
**Propuesta:** Agregar `?search=texto` en el endpoint de leads con `ILike('%texto%')` en TypeORM.

---

## Prioridad MEDIA (UX)

### 4. Kanban de CRM
**Situación:** Los leads se muestran en tabla. Un board tipo Kanban por `status` mejoraría la gestión.
**Requisito previo:** `@angular/cdk/drag-drop` o implementación manual.
**Decisión anterior:** Excluido del alcance de Fase 3 por complejidad.

### 5. Notificaciones de seguimientos vencidos
**Situación:** Los leads con `followUpDate` pasado se marcan con naranja en la tabla.
**Propuesta:** Agregar badge rojo en el sidebar + toast al entrar al panel si hay seguimientos vencidos.

### 6. Gráficas de tendencia (Chart.js o ApexCharts)
**Situación:** Las analíticas muestran distribución estática.
**Propuesta:** Integrar Chart.js para gráfica de leads por semana/mes.
**Criterio:** Solo si el backend expone endpoint `/dashboard/trends?period=weekly`.

### 7. Selector de período en Dashboard
**Situación:** El encabezado del Dashboard tiene comentario `<!-- selector de periodo -->`.
**Propuesta:** Implementar dropdown Hoy/Esta semana/Este mes que pase `?period=` al endpoint.
**Requisito previo:** Backend debe soportar el filtro de período en `/dashboard/summary`.

---

## Prioridad BAJA (refinamiento)

### 8. Envío real de emails con Resend
**Situación:** `EMAIL_PROVIDER=mock` bloqueado por regla de seguridad del proyecto.
**Acción requerida:** Autorización explícita del propietario del proyecto.
**Nunca habilitar sin autorización.**

### 9. Integración con calendario (seguimientos)
**Propuesta:** Botón "Agregar al calendario" en la ficha CRM que genere un `.ics` o integre con Google Calendar API.

### 10. Upload de archivos adjuntos a leads
**Propuesta:** Campo de adjuntos (propuestas, contratos) en la ficha comercial del lead.
**Requisito:** Configurar almacenamiento (local o Cloud Storage).

---

## Deuda técnica

| Item | Descripción |
|---|---|
| Tests frontend | No existen tests de componentes Angular (solo backend) |
| Logging centralizado | El backend usa `console.log` en algunos lugares |
| Rate limiting | No hay throttling en endpoints públicos del lead magnet |
| Refresh token | El auth actual usa access_token sin refresh; expira en X tiempo |

---

## Reglas que NO cambian

- ❌ NEVER push to main
- ❌ NEVER deploy to Dokploy
- ❌ NEVER enable EMAIL_PROVIDER=resend without explicit authorization
- ❌ NEVER modify production database directly
- ❌ NEVER hardcode credentials or tokens

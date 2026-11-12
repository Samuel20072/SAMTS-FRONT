# FASE 3.1 — Pendientes y Hoja de Ruta Post-Auditoría

**Estado del Proyecto:** FASE 3.1 COMPLETADA Y CERRADA ✅  
**Ramas Actuales:** `feat/admin-operations-hub` en ambos repositorios.

---

## 1. Deuda Técnica y Recomendaciones para Futuras Fases

### Prioridad Media
1. **Paginación en Servidor para Leads:**
   - Actualmente `/api/lead-magnet/leads` retorna el listado completo y la paginación/filtrado se realiza en memoria en el frontend de Angular.
   - *Recomendación:* Cuando el volumen supere los 1.000 leads, implementar `page` y `limit` en el repositorio TypeORM.
2. **WebSockets para Notificaciones en Tiempo Real:**
   - Actualmente el Dashboard requiere clic en "Actualizar" para recargar las métricas de nuevos prospectos.
   - *Recomendación:* Implementar Gateway Socket.io en el backend para emitir eventos `lead.created` y `lead.updated` hacia el panel administrativo.
3. **Vitest Browser Headless en Frontend:**
   - El runner de tests de Angular 19 requiere instalar un proveedor de navegador (`@vitest/browser-playwright` o similar) para ejecutar pruebas unitarias de componentes desde la terminal sin interfaz gráfica.

### Prioridad Baja / Extensiones Futuras
4. **Exportación a PDF en Analíticas:**
   - Se removió el botón simulado de descarga de PDF. Para implementar un reporte real, se recomienda utilizar `@react-pdf/renderer` o `pdfmake` en backend o frontend.
5. **Tablero Kanban con Drag & Drop:**
   - Las transiciones de estado se ejecutan actualmente desde selectores desplegables en la tabla y ficha comercial.
   - *Recomendación:* Evaluar la integración de `@angular/cdk/drag-drop` para una vista de tarjetas interactiva por columnas de estado.

---

## 2. Reglas de Publicación y Despliegue (Recordatorio)

- ⛔ **NO ejecutar `git push`** sin autorización expresa del propietario.
- ⛔ **NO fusionar a `main`** sin antes someter la rama a revisión de Pull Request.
- ⛔ **NO modificar variables de entorno de producción en Dokploy**.
- ⛔ **Preservar `EMAIL_PROVIDER=mock`** hasta que se apruebe la campaña de envío de correos transaccionales reales.

# FASE 3 — Dashboard Comercial SAMTS

## Ruta: `/admin/dashboard`

### Componentes involucrados
- `src/app/pages/admin/dashboard.page.ts`
- `src/app/pages/admin/dashboard.page.html`
- `src/app/services/api/dashboard.service.ts`

### Endpoint consumido
```
GET /api/v1/dashboard/summary
Authorization: Bearer <token>
Rol requerido: SUPER_ADMIN
```

### Respuesta esperada (`DashboardStats`)
```typescript
interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  openOpportunities: number;
  pendingFollowUps: number;
  estimatedPipelineValue: number;
  conversionRate: number;
  wonLeads: number;
  wonRevenue: number;
  leadsByStatus: Record<string, number>; // { 'NEW': 5, 'QUALIFIED': 3, ... }
  recentLeads: LeadSummary[];
}
```

### Funcionalidades implementadas
1. **Encabezado dinámico** — saludo contextual (Buenos días/tardes/noches) + fecha actual
2. **8 tarjetas KPI** con datos reales del backend:
   - Total Leads, Leads Nuevos, Oportunidades Abiertas, Seguimientos Pendientes
   - Valor estimado del pipeline (COP), Tasa de conversión (%), Clientes Ganados, Ingresos Ganados
3. **Embudo de ventas** — barra horizontal proporcional con 5 etapas:
   `NEW → QUALIFIED → PROPOSAL → NEGOTIATION → WON`
4. **Tabla de leads recientes** — máximo 5 registros con badge de estado y enlace a CRM
5. **Acciones rápidas** — botones directos a CRM, Leads nuevos, Seguimientos, Servicios
6. **Estados de carga y error** — skeleton loader + botón de reintentar
7. **Botón de refresco** — recarga datos sin recargar la página

### Diseño (White Experience)
- Fondo: `bg-slate-50`
- Tarjetas: `bg-white border border-slate-200 rounded-xl shadow-sm`
- Acento principal: `text-blue-600 bg-blue-600`
- Sin clases `dark:` en ningún elemento
- Sin estadísticas ficticias ni multiplicadores artificiales

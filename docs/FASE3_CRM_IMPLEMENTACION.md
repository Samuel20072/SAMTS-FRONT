# FASE 3 — CRM y Gestión de Leads

## Ruta: `/admin/leads`

### Componente
- `src/app/pages/admin/leads/leads.component.ts` (template inline)

### Endpoints consumidos
```
GET    /api/v1/lead-magnet/leads          → Lista todos los leads (SUPER_ADMIN)
PATCH  /api/v1/lead-magnet/leads/:id/status → Actualiza estado + campos CRM
```

### Modelo de Lead (campos CRM extendidos en Fase 2)
```typescript
interface LeadResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  solution?: string;
  status: LeadStatus; // NEW | CONTACTED | QUALIFIED | PROPOSAL | NEGOTIATION | WON | LOST | DISCARDED
  estimatedValue?: number;      // Valor estimado del negocio (COP)
  dealStage?: string;           // Etapa del negocio (libre)
  assignedTo?: string;          // Responsable asignado
  followUpDate?: string;        // Próximo seguimiento (ISO date)
  nextAction?: string;          // Próxima acción planificada
  notes?: string;               // Notas internas
  activityHistory?: LeadActivity[]; // Historial cronológico
  source?: string;
  campaignId?: string;
  createdAt: string;
}
```

### Funcionalidades implementadas

#### 1. Barra superior de métricas
- Total leads, Valor del pipeline (COP), Clientes ganados, Seguimientos vencidos

#### 2. Filtros y búsqueda
- Búsqueda por nombre/email/solución
- Filtro por estado (todos los estados del enum)
- Filtro por campaña

#### 3. Tabla principal (7 columnas)
| Columna | Contenido |
|---|---|
| Prospecto | Nombre + email + teléfono |
| Interés | Solución solicitada |
| Estado | Dropdown editable inline |
| Valor Est. | Campo numérico COP |
| Responsable | Texto libre |
| Próx. Seguimiento | Fecha con alerta si está vencida |
| Acciones | Expandir ficha, WhatsApp, Email |

#### 4. Ficha comercial expandida (3 columnas)
**Columna 1 — Información del Lead**
- Tipo de empresa, problema detectado, detalles de la consulta

**Columna 2 — Campos Comerciales**
- Valor estimado, Responsable, Etapa del negocio
- Fecha próximo seguimiento, Próxima acción, Notas
- Botón "Guardar cambios" → llama al endpoint PATCH

**Columna 3 — Historial de Actividad**
- Timeline cronológico de actividades
- Formulario "Registrar actividad": tipo (Llamada, Email, WhatsApp, Reunión, Propuesta, Otro) + descripción
- Botón "Agregar" → llama al endpoint PATCH con `activityEntry`

#### 5. Acciones de contacto
- WhatsApp con mensaje pre-llenado: nombre, solución, agradecimiento
- Email con asunto pre-llenado

#### 6. Exportación CSV
Incluye todos los campos CRM: estimatedValue, assignedTo, dealStage, followUpDate, nextAction, notes

### Payload de actualización CRM
```typescript
interface UpdateLeadStatusPayload {
  status?: LeadStatus;
  estimatedValue?: number;
  dealStage?: string;
  assignedTo?: string;
  followUpDate?: string;
  nextAction?: string;
  notes?: string;
  activityEntry?: { type: string; description: string; };
}
```

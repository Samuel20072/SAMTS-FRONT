# FASE 3 — Analíticas SAMTS

## Ruta: `/admin/analytics`

### Componente
- `src/app/pages/admin/analytics/analytics.component.ts` (template inline)

### Endpoint consumido
```
GET /api/v1/dashboard/summary
Authorization: Bearer <token>
Rol requerido: SUPER_ADMIN
```

> Reutiliza el mismo endpoint del Dashboard para mantener consistencia y no duplicar llamadas.

### Funcionalidades implementadas

#### 1. KPIs principales (4 tarjetas)
| Métrica | Dato |
|---|---|
| Tasa de Conversión | `conversionRate` (%) calculado en backend |
| Valor del Pipeline | `estimatedPipelineValue` (COP) |
| Ingresos Ganados | `wonRevenue` (COP) |
| Seguimientos Pendientes | `pendingFollowUps` (count) |

#### 2. Distribución por estado (gráfica horizontal)
- Lee `leadsByStatus: Record<string, number>` del backend
- Calcula porcentaje de cada estado vs total
- Renderiza barra horizontal proporcional con color por estado
- Estados soportados: `NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST, DISCARDED`

#### 3. Inventario operativo (4 tarjetas)
| Dato | Fuente |
|---|---|
| Productos/Servicios activos | `totalProducts` |
| Promociones activas | `activePromotions` |
| Artículos publicados | `totalBlogPosts` |
| Clientes ganados | `wonLeads` |

### Qué se eliminó (Fase 3)
- ❌ Gráfica SVG de barras con datos ficticios
- ❌ `aiGeneratedContentCount` fake
- ❌ Porcentajes de crecimiento simulados (`+12.4%`)
- ❌ Botón "Exportar informe PDF" (sin funcionalidad real)
- ❌ Multiplicadores artificiales en cualquier métrica

### Diseño (White Experience)
- Sin clases `dark:`
- Sin gradientes oscuros
- Sin estadísticas hardcodeadas

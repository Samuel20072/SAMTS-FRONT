# FASE 3.3 — CORRECCIONES COMERCIALES E INFORMACIÓN FINANCIERA

**Repositorios:** `~/SAMTS/SAMTS-BACKEND` + `~/SAMTS/SAMTS-FRONT`
**Fecha:** 2026-11-12

---

## 1. Hallazgo
El indicador `wonRevenue` del dashboard representa el **valor estimado de oportunidades ganadas** (suma de `estimatedValue` de los leads en estado `WON`), pero la interfaz lo rotulaba como **"Ingresos Ganados"** / "Monto de ventas cerradas", lo que podía interpretarse como **dinero efectivamente cobrado**.

---

## 2. Semántica real de los indicadores (verificada)

En `src/features/dashboard/application/dashboard.service.ts`:

| Campo | Origen | Significado |
|---|---|---|
| `estimatedPipelineValue` | Suma de `estimatedValue` de leads en estados **abiertos** (NEW, CONTACTED, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, FOLLOW_UP, SELECTED, WAITLIST) | **Pipeline abierto** (valor estimado, no cerrado) |
| `wonRevenue` | Suma de `estimatedValue` de leads en estado **WON** | **Valor contractual ganado/estimado** (no cobrado) |
| `totalRevenue` | `SUM(sale.total)` sobre la tabla **`Sale`** | **Ingresos reales** respaldados por transacciones |

Conclusión: `totalRevenue` ya está respaldado únicamente por transacciones reales (`Sale`). **No se requirió cambiar la lógica del backend**, solo la **etiqueta de interfaz** de `wonRevenue`.

---

## 3. Cambios aplicados (solo etiquetas de UI)

### `dashboard.page.html`
```diff
- <!-- Ingresos Ganados -->
- <span ...>Ingresos Ganados</span>
- <p ...>Monto de ventas cerradas</p>
+ <!-- Valor Ganado (Estimado) — no representa dinero cobrado -->
+ <span ...>Valor Ganado (Estimado)</span>
+ <p ...>Valor estimado de oportunidades ganadas (no facturado)</p>
```

### `analytics/analytics.component.ts`
```diff
- <!-- Won Revenue -->
- <span ...>Ventas Ganadas</span>
- <p ...>Cierres comerciales confirmados</p>
+ <!-- Won Revenue (valor estimado, no dinero cobrado) -->
+ <span ...>Valor Ganado (Estimado)</span>
+ <p ...>Valor estimado de cierres ganados (no facturado)</p>
```

### `leads/leads.component.ts`
El valor estimado de los leads ganados aparecía junto al contador sin etiqueta. Se añadió `title` y prefijo "Val. est." para evitar lectura como dinero cobrado:
```diff
- <span ...>\${{ wonRevenue() | number:'1.0-0' }}</span>
+ <span ... title="Valor estimado de oportunidades ganadas (no facturado)">Val. est. \${{ wonRevenue() | number:'1.0-0' }}</span>
```

---

## 4. Diferenciación explícita en la UI
- **Pipeline abierto:** `estimatedPipelineValue` → "Valor en Pipeline" / "Pipeline Valor" / "Pipeline Estimado".
- **Valor contractual ganado/estimado:** `wonRevenue` → "Valor Ganado (Estimado)".
- **Ingresos efectivamente cobrados:** `totalRevenue` (respaldado por `Sale`). No se añadió tarjeta nueva ni datos inventados.

---

## 5. Backend / pruebas
- **Sin cambios de lógica** en `dashboard.service.ts` (la semántica ya era correcta).
- La prueba existente `dashboard-samts-operations.spec.ts` ya valida `wonRevenue === estimatedValue` del lead WON (3.2M) y que `estimatedPipelineValue` = suma de leads abiertos (7.0M). Se mantiene vigente y pasa.
- No se inventaron transacciones ni información financiera.

## 6. Archivos afectados
`dashboard.page.html`, `analytics/analytics.component.ts`, `leads/leads.component.ts` (solo frontend).

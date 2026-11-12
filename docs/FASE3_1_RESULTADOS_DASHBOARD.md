# FASE 3.1 — Resultados de Pruebas de Pipeline y Dashboard

**Módulo:** Torre de Control Comercial (`/admin/dashboard`)  
**Backend:** `DashboardController` / `DashboardService`  
**Endpoint:** `GET /api/dashboard`

---

## 1. Verificación del Embudo Comercial

Se ejecutaron transiciones de estado secuenciales sobre el lead de prueba para comprobar la actualización reactiva y matemática de las métricas comerciales:

### Estado 1: Lead en `NEW` (Nuevo prospecto)
- `totalLeads`: 2 (Samuel + Carlos)
- `newLeads`: 2
- `openOpportunities`: 2
- `estimatedPipelineValue`: $0
- `conversionRate`: 0%
- `wonRevenue`: $0

### Estado 2: Lead en `QUALIFIED` con valor $3.500.000 COP
- `totalLeads`: 2
- `qualifiedLeads`: 1
- `openOpportunities`: 2
- `estimatedPipelineValue`: **$3.500.000 COP**
- `conversionRate`: 0%
- `wonRevenue`: $0

### Estado 3: Lead en `PROPOSAL_SENT`
- `proposalSentLeads`: 1
- `openOpportunities`: 2
- `estimatedPipelineValue`: **$3.500.000 COP**
- `conversionRate`: 0%

### Estado 4: Lead en `WON` (Oportunidad Ganada)
- `openOpportunities`: 1 (Se descuenta de abiertas porque ya cerró)
- `wonLeads`: 1
- `conversionRate`: **50.0%** (1 ganado sobre 2 leads totales)
- `estimatedPipelineValue`: $0 (La oportunidad abierta restante no tiene valor asignado)
- `wonRevenue`: **$3.500.000 COP** (Ingreso potencial ganado)

### Estado 5: Lead en `LOST` (Oportunidad Perdida)
- `openOpportunities`: 1
- `lostLeads`: 1
- `wonLeads`: 0
- `conversionRate`: 0%
- `wonRevenue`: $0

---

## 2. Distinción Financiera Rigurosa

Siguiendo las instrucciones obligatorias:

1. **Valor Estimado de Oportunidades Abiertas (`estimatedPipelineValue`):**
   - Corresponde a la sumatoria de `estimatedValue` de leads en estados abiertos (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `NEGOTIATION`).
   - Representa el pipeline potencial en negociación.

2. **Valor de Oportunidades Ganadas (`wonRevenue`):**
   - Corresponde a la sumatoria de `estimatedValue` de leads en estado `WON`.
   - Representa el valor contractual de negocios cerrados con éxito por la agencia.

3. **Ingresos Efectivamente Cobrados (`totalRevenue`):**
   - Proviene de la entidad `Sale` respaldada por transacciones de pago.
   - Si no hay pagos registrados, se reporta estrictamente en **$0 COP**.
   - **No se presenta dinero ganado como dinero cobrado.**

---

## 3. Eliminación Definitiva de Datos Simulados

- Se verificó la total ausencia de la propiedad `aiGeneratedContentCount` (anteriormente simulada como `totalBlogPosts * 10`).
- No existen porcentajes de crecimiento hardcodeados en backend ni en frontend.
- Las tarjetas operativas (`totalProducts`, `totalBlogPosts`, `totalPromotions`, `activePromotions`) consumen conteos directos `count()` de las tablas TypeORM correspondientes.

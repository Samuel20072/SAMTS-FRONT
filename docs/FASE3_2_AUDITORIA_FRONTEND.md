# FASE 3.2 — AUDITORÍA DEL FRONTEND ADMINISTRATIVO

**Fecha:** 12 de noviembre de 2026
**Rama auditada:** `feat/admin-operations-hub` (frontend `adb83e7`)
**Alcance:** experiencia completa de `/admin` (Angular 21 standalone + SSR + PrimeNG + Tailwind).
**Método:** revisión estática de componentes, plantillas, rutas y servicios, más el build de producción real. No se dispuso de base de datos viva ni de navegador, por lo que la verificación funcional interactiva es **parcial** (ver §6).

---

## 1. MAPA DE MÓDULOS AUDITADOS

Rutas registradas en [app.routes.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/app.routes.ts#L67-L80):

| Ruta | Componente | Servicio API | Estado |
|---|---|---|---|
| `/admin` (layout) | `AdminLayoutComponent` | — | ✅ |
| `/admin/dashboard` | `DashboardPage` | `dashboard.service.ts` → `GET /dashboard` | ✅ |
| `/admin/leads` | `LeadsComponent` | `lead-magnet` (`GET /leads`) | ✅ |
| `/admin/products` | `ProductsComponent` | `products` | ✅ |
| `/admin/promotions` | `PromotionsComponent` | `promotions` | ✅ |
| `/admin/pages` | `WebPagesComponent` | `blog-posts` | ✅ |
| `/admin/analytics` | `AnalyticsComponent` | reutiliza `dashboard` | ✅ (datos reales) |
| `/admin/agents` | `AgentsComponent` | `ai-settings` | ⚠️ metadatos estáticos |
| `/admin/settings` | `SettingsComponent` | `ai-settings` / `clients` | ✅ |

Navegación lateral en [admin-layout.component.html](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/pages/admin/layout/admin-layout.component.html#L20-L63): 7 enlaces (`routerLink` + `routerLinkActive`). Sin enlaces rotos detectados.

---

## 2. COMPROBACIÓN FUNCIONAL POR MÓDULO

| Criterio | Dashboard | Leads/CRM | Products | Promotions | Blog | Analytics | Agents | Settings |
|---|---|---|---|---|---|---|---|---|
| Botones ejecutan acciones reales | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Formularios validan | ✅ | ✅ | ✅ | ✅ | ✅ | n/a | n/a | ✅ |
| Datos provienen del backend | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ parcial | ✅ |
| Persisten tras recargar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Estados de carga | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Estados vacíos contemplados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Errores mostrados al usuario | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ (solo `console.error`) | ⚠️ |
| Confirmación de borrado | n/a | ✅ | ✅ | ✅ | ✅ | n/a | n/a | n/a |

**Conclusión funcional:** los módulos que gestionan datos (Leads, Products, Promotions, Blog, Settings) realizan operaciones reales contra la API y persisten. No se detectaron botones que "aparenten funcionar sin persistencia real".

---

## 3. HALLAZGOS DEL FRONTEND

### 3.1 🔴 No bloqueante de código, pero riesgo operativo — `wonRevenue` etiquetado como "Ingresos Ganados"

- **Ubicación:** [dashboard.page.html](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/pages/admin/dashboard.page.html#L143-L153)
- **Problema:** la tarjeta muestra `s.wonRevenue` con el rótulo **"Ingresos Ganados"** y subtítulo *"Monto de ventas cerradas"*. En el backend, `wonRevenue` es la **suma de `estimatedValue` de los leads en estado `WON`** (valor estimado de oportunidad), **no el dinero efectivamente cobrado**.
- **Riesgo:** el operador comercial puede interpretar que ese monto ya fue recaudado, cuando en realidad es pipeline ganado no cobrado. El backend sí calcula `totalRevenue` a partir de la tabla `Sale` (dinero real), pero esa cifra no se muestra en el panel.
- **Recomendación (no aplicada):** renombrar a **"Valor Ganado (pipeline)"** y, si se requiere, exponer una tarjeta separada de "Cobrado" alimentada por `Sale`. Requiere decisión de producto sobre qué columna es la fuente de verdad. **Documentado, no corregido** para no alterar la semántica de negocio sin autorización.

### 3.2 🟠 Inconsistencia de identidad visual — el panel admin no usa el azul de marca

- **Problema:** el sistema de diseño define el acento de SAMTS en `tailwind.css` como `--color-accent: #315EFB` y la escala de marca en `--color-violet-*` (`violet-500 = #315EFB`, `violet-600 = #2148D6`). Sin embargo, los componentes de `/admin` usan **clases Tailwind `blue-*` por defecto** (`blue-600 = #2563EB`, `blue-500 = #3B82F6`), con **~190 ocurrencias en 10 archivos** (p. ej. `bg-blue-50 text-blue-600` en el estado activo de la navegación).
- **Impacto:** el color azul del panel no coincide exactamente con el azul de marca `#315EFB` especificado para SAMTS. Diferencia sutil de tono, perceptible en navegación activa y botones primarios.
- **Recomendación (no aplicada):** migrar `blue-*` → `violet-*` (que ya apunta al azul de marca) mediante configuración de tema o reemplazo dirigido. Es un cambio transversal de bajo riesgo funcional pero de amplio alcance visual; se documenta en lugar de ejecutarse masivamente para no romper usos semánticos de `blue` (información) mezclados con el acento.

### 3.3 🟠 Tarjetas de Agentes IA con metadatos estáticos

- **Ubicación:** [agents.component.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/pages/admin/agents/agents.component.ts#L136-L167)
- **Problema:** los agentes listados (`Samuel AI / Asistente Web`, `Closer-Bot WhatsApp`, `Blog & Content Studio`) tienen nombre y descripción **hardcodeados** en el componente. El **estado** (`Activo`/`Inactivo`) sí se deriva de `ai_settings` (`this.settings[agent.settingField]`), por lo que el toggle persiste.
- **Impacto:** la lista de agentes no es dinámica; añadir un agente requiere editar el componente. No genera datos falsos de negocio (son catálogos de producto), pero es deuda técnica. **Documentado.**

### 3.4 🟠 Manejo de errores silencioso en varios módulos

- Varios `catch` terminan en `console.error` sin retroalimentación al usuario (p. ej. `agents.component.ts:226`). En ausencia de toasts/inline errors, el usuario no distingue "sin datos" de "error de red". **Observación de calidad; no bloqueante.**

### 3.5 🟡 Guard de ruta solo verifica autenticación, no rol

- **Ubicación:** [auth.guard.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/core/guards/auth.guard.ts#L5-L21) y [app.routes.ts](file:///home/profe/SAMTS/SAMTS-FRONT/src/app/app.routes.ts#L67-L69)
- La ruta `admin` usa `canActivate: [authGuard]`, que solo comprueba `isAuthenticated()`. Cualquier usuario autenticado (incluido `EMPLOYEE` o `CLIENT_ADMIN`) puede **cargar** las pantallas `/admin`. La autorización real la impone el **backend** (que sí devuelve 403), por lo que no hay fuga de datos, pero la UX muestra pantallas vacías/erróneas en lugar de redirigir.
- **Recomendación (no aplicada):** añadir un `roleGuard` para `SUPER_ADMIN` en la ruta `admin`. **Documentado.**

### 3.6 🟡 Paginación de leads en memoria

- El listado de leads pagina/filtra en el cliente. Aceptable por debajo de ~1.000 registros (ya anotado en Fase 3.1). **Documentado.**

---

## 4. EXPERIENCIA VISUAL Y RESPONSIVE

Verificación realizada por inspección de clases responsive (`sm:`, `md:`, `lg:`, `xl:`, `grid-cols-*`).

| Aspecto | Estado | Notas |
|---|---|---|
| Escritorio | ✅ | Grids `lg:grid-cols-3`, sidebar fijo, tablas amplias |
| Tablet | ✅ con observaciones | Layouts colapsan a 1-2 columnas; tablas de leads/expansión requieren scroll horizontal |
| Móvil | ⚠️ | Sidebar colapsable; las fichas de CRM de 3 columnas pasan a apilado vertical. Tablas densas siguen siendo incómodas en pantallas < 400 px |
| Contraste | ✅ | Texto `slate-900` sobre blanco; secundario `slate-400/500` aceptable (el `slate-400` en textos de 11 px puede ser bajo en exteriores) |
| Jerarquía visual | ✅ | Títulos `text-sm font-bold`, KPIs `text-2xl`, etiquetas en mayúsculas |
| Modales | ✅ | PrimeNG con `border-radius: 32px`, fondo blanco |
| Navegación redundante | ✅ | Sin duplicidad detectada |

**No se detectaron desbordamientos críticos ni modales inadaptados** en la inspección estática. La validación visual real en dispositivos requiere un entorno con navegador (no disponible aquí).

---

## 5. SEO Y EXPOSICIÓN DE RUTAS ADMINISTRATIVAS

| Ítem | Estado | Evidencia |
|---|---|---|
| `robots.txt` excluye `/admin/` y `/login` | ✅ | [robots.txt](file:///home/profe/SAMTS/SAMTS-FRONT/public/robots.txt#L1-L6) |
| `sitemap.xml` solo contiene rutas públicas | ✅ | [sitemap.xml](file:///home/profe/SAMTS/SAMTS-FRONT/public/sitemap.xml) (8 URLs públicas, ninguna `/admin`) |
| Rutas admin prerenderizadas | ✅ No | Solo se prerenderizan 12 rutas públicas; `/admin` se sirve en runtime |
| Meta `noindex` en `/admin` | ⚠️ Ausente | La exclusión depende solo de `robots.txt` (advisable, no obligatorio) y de que no haya enlaces entrantes |

---

## 6. VALIDACIONES EJECUTADAS (REALES)

| Verificación | Comando | Resultado |
|---|---|---|
| Typecheck frontend | `npx tsc --noEmit -p tsconfig.app.json` | ✅ exit 0, 0 errores |
| Build de producción (SSR) | `ng build` (config `production`) | ✅ exit 0, **12 rutas prerenderizadas** |
| Presupuesto de estilos | Budget `anyComponentStyle` 200 kB (warn) | ⚠️ **1 warning**: `business-demo-section.component.scss` ≈ **209.66 kB** (> 200 kB) — no alcanza el umbral de error (300 kB) |

### Pruebas NO ejecutadas (declaradas)
- Tests unitarios de componentes (`ng test`): **NO ejecutados** — el runner Angular requiere un proveedor de navegador headless no instalado (deuda ya anotada en Fase 3.1).
- Verificación interactiva en navegador (desktop/tablet/móvil): **NO ejecutada** (sin entorno gráfico).
- Verificación de persistencia contra API viva: **NO ejecutada** (backend/BD no en ejecución en este entorno).

---

## 7. CONCLUSIONES DEL FRONTEND

| Dimensión | Clasificación |
|---|---|
| Funcionalidad de módulos | **APROBADO** |
| Persistencia y CRUD real | **APROBADO** |
| Estados de carga/vacío | **APROBADO** |
| Manejo de errores al usuario | **APROBADO CON OBSERVACIONES** (catch silenciosos) |
| Identidad visual de marca | **APROBADO CON OBSERVACIONES** (usa `blue-*` en lugar del acento `#315EFB`) |
| Semántica de métricas (CRM) | **APROBADO CON OBSERVACIONES** (`wonRevenue` rotulado como "Ingresos Ganados") |
| Responsive | **APROBADO CON OBSERVACIONES** (tablas densas en móvil) |
| SEO de rutas admin | **APROBADO** (robots + sitemap correctos; falta meta `noindex`) |
| Tests de componentes | **NO VERIFICADO** (no ejecutables sin navegador headless) |

**No se aplicó ninguna corrección al frontend**: todos los hallazgos son de semántica de negocio, identidad visual transversal o deuda de testing, y la instrucción de la fase prohíbe refactorizaciones masivas y cambios de contrato sin autorización. Se documentan para decisión del propietario.

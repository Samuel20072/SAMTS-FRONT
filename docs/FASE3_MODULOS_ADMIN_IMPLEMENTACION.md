# FASE 3 — Módulos Administrativos SAMTS

## Módulos incluidos en este documento
1. Admin Layout
2. Productos y Servicios
3. Promociones
4. Blog / Páginas Web
5. Agentes IA
6. Configuración

---

## 1. Admin Layout
**Archivo:** `src/app/pages/admin/layout/admin-layout.component.ts` + `.html`

### Funcionalidades
- Sidebar blanco (`bg-white border-r border-slate-200`) con 8 nav items
- Logo "SAMTS Control" con icono `bg-blue-600`
- `routerLinkActive="bg-blue-50 text-blue-600 font-semibold"` en navegación
- Bloque de usuario + botón Cerrar sesión (`logout()` → `authService.logout()` + router a `/`)
- Header blanco con breadcrumb y botón Copilot
- Panel AI Copilot: fondo blanco, acento azul-600
- Área de contenido: `bg-slate-50`
- **Sin clases `dark:` en ningún elemento**
- **Sin texto "Neural Admin"** (reemplazado por "Asistente SAMTS")

---

## 2. Productos y Servicios
**Archivo:** `src/app/pages/admin/products/products.component.ts`

**Endpoint:** `GET/POST/PUT/DELETE /api/v1/products`
**Isolación:** `clientId = null` → productos globales de SAMTS

### Categorías SAMTS
```typescript
const CATEGORIES = [
  'Páginas Web',
  'Catálogos Digitales',
  'Tiendas Virtuales',
  'Agentes IA',
  'Sistemas Administrativos',
  'Mantenimiento & Soporte'
];
```

### Campos del formulario
- `name`, `description`, `price`, `category`, `deliveryTime`, `features[]`
- Toggle "Destacado" (`featured`) — usa `bg-amber-500`

### Diseño
- Grid de tarjetas con badge de categoría (color distinto por categoría, sin purple)
- Modal de creación/edición con validación básica

---

## 3. Promociones
**Archivo:** `src/app/pages/admin/promotions/promotions.component.ts`

**Endpoint:** `GET/POST/PUT/DELETE /api/v1/promotions`
**Isolación:** `clientId = null` → promociones globales de SAMTS

### Campos implementados (Fase 2 sincronizó backend)
```typescript
{
  name: string;
  description?: string;
  code: string;         // Auto-uppercase al enviar
  discountPercent: number; // 1-100
  startDate: string;    // ISO date
  endDate: string;      // ISO date, debe ser >= startDate
  isActive: boolean;
}
```

### Validaciones frontend
- `discountPercent` entre 1 y 100 (error: `formErrors.discountPercent`)
- `endDate >= startDate` (error: `formErrors.dates`)
- `code` auto-uppercase al enviar

### Valores por defecto
- `discountPercent: 15`
- `code: 'SAMTS15'`
- `startDate`: hoy
- `endDate`: hoy + 30 días

---

## 4. Blog / Páginas Web
**Archivo:** `src/app/pages/admin/pages/web-pages.component.ts`

**Endpoint:** `GET/POST/PUT /api/v1/blog-posts`
**Isolación:** `clientId = null` → artículos globales de SAMTS

### Funcionalidades
- Grid de artículos con badge Publicado/Borrador
- Formulario de creación manual: `title`, `excerpt`, `content`, `slug`, `tags`
- Generación con IA: llama a `templateEngineService.generatePage()` → rellena `title`, `content` y `excerpt`
- Error handler no-fatal en `loadClientContext()`
- Payload con `.trim()` en todos los strings

---

## 5. Agentes IA
**Archivo:** `src/app/pages/admin/agents/agents.component.ts`

**Endpoints:**
- `GET /api/v1/ai-settings` → configuración del agente
- `PUT /api/v1/ai-settings` → actualizar toggle activo/inactivo

### Qué se eliminó
- ❌ "1,245 interacciones" falso
- ❌ "94.2% tasa de éxito" falso
- ❌ Agentes representados como autónomos

### Qué está implementado
- 3 tarjetas de agentes con descripción real de capacidades
- Estado: `Activo | Inactivo` (tipo `AgentInfo`)
- Toggle switches conectados a `aiSettingsService.update()`
- Sección de contexto: tone, objective, businessName desde AI Settings

---

## 6. Configuración
**Archivo:** `src/app/pages/admin/settings/settings.component.ts`

**Endpoint:** `GET/PUT /api/v1/ai-settings`

### Funcionalidades
- Banner de perfil de usuario con iniciales "AD"
- Formulario de configuración del agente: `businessName`, `tone`, `objective`
- Formulario de asistente IA: `greetingMessage`, `maxTokens`, `temperature`
- 2 toggles de automatización: "Generación automática de blog" + "Respuestas automáticas WhatsApp"
- `savedMessage` signal → mensaje de éxito inline (sin `alert()`)

### Acceso
- `SUPER_ADMIN` sin restricción
- Resuelto el bloqueo anterior por rol `SUPER_ADMIN` en backend (Fase 2)

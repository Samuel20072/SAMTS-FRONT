/* ═══════════════════════════════════════════════════════════
   Samuel AI — Conversation Question Tree
   Defines all steps, messages, and quick-reply options.
   ═══════════════════════════════════════════════════════════ */

import { DiagnosisStep, QuickReplyOption } from '../models/samuel.models';

export interface QuestionStep {
  step: DiagnosisStep;
  /** Samuel's message(s) — the last one shows the quick replies */
  messages: string[];
  quickReplies: QuickReplyOption[];
  /** Answer key in DiagnosticAnswers */
  answerKey: string;
  /** If true, text input is always shown in addition to quick replies */
  allowFreeText?: boolean;
  inputPlaceholder?: string;
}

export const SAMUEL_INTRO_MESSAGES: string[] = [
  '¡Hola! Soy Samuel, la IA de SAMTS. 👋',
  'Estoy aquí para ayudarte a descubrir cómo podemos mejorar tu negocio con tecnología.',
  '¡Empecemos! Cuéntame, ¿qué tipo de negocio tienes?',
];

export const HOME_INTRO_MESSAGES: string[] = [
  '¡Hola! Soy Samuel, la IA de SAMTS. 👋',
  'Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?',
];

export const HOME_FIRST_REPLIES: QuickReplyOption[] = [
  { id: 'home-1', label: '🌐 Crear una página web', value: 'Quiero crear una página web profesional' },
  { id: 'home-2', label: '🛒 Vender por internet', value: 'Quiero vender mis productos por internet' },
  { id: 'home-3', label: '🤖 Automatizar mensajes o tareas', value: 'Quiero automatizar respuestas o procesos' },
  { id: 'home-4', label: '⚙️ Sistema para mi empresa', value: 'Necesito un software o sistema a medida' },
  { id: 'home-5', label: '📈 Mejorar mis ventas digitales', value: 'Quiero optimizar mi presencia digital y vender más' },
  { id: 'home-6', label: '🔍 Explorar qué me conviene', value: 'Quiero que me asesores sobre qué me conviene' },
];

export const QUESTION_STEPS: QuestionStep[] = [
  // Step 1 — Goal / Objetivo principal
  {
    step: 'goal',
    messages: ['Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?'],
    answerKey: 'goal',
    allowFreeText: true,
    inputPlaceholder: 'Ej. Quiero crear una página para vender mis productos...',
    quickReplies: [
      { id: 'goal-1', label: '🌐 Crear una página web', value: 'Quiero crear una página web profesional' },
      { id: 'goal-2', label: '🛒 Vender por internet', value: 'Quiero vender mis productos por internet' },
      { id: 'goal-3', label: '🤖 Automatizar mensajes o tareas', value: 'Quiero automatizar respuestas o procesos con IA' },
      { id: 'goal-4', label: '⚙️ Sistema para mi empresa', value: 'Necesito un software o sistema a medida' },
      { id: 'goal-5', label: '📈 Mejorar mis ventas digitales', value: 'Quiero optimizar mi presencia digital y vender más' },
      { id: 'goal-6', label: '🔍 Explorar qué me conviene', value: 'Quiero que me asesores sobre qué me conviene' },
    ],
  },

  // Step 2 — Business type
  {
    step: 'business-type',
    messages: ['¡Excelente! ¿Qué tipo de negocio tienes o estás creando?'],
    answerKey: 'businessType',
    allowFreeText: true,
    inputPlaceholder: 'Ej. Tengo una tienda de ropa...',
    quickReplies: [
      { id: 'biz-1', label: '👗 Tienda de ropa o boutique', value: 'Tienda de ropa o boutique' },
      { id: 'biz-2', label: '🍽️ Restaurante o cafetería', value: 'Restaurante o cafetería' },
      { id: 'biz-3', label: '✂️ Barbería o servicios', value: 'Barbería o negocio de servicios' },
      { id: 'biz-4', label: '📦 Tienda de productos', value: 'Tienda de productos' },
      { id: 'biz-5', label: '💼 Empresa de servicios', value: 'Empresa de servicios' },
      { id: 'biz-6', label: '🏢 Empresa mediana o grande', value: 'Empresa mediana o grande' },
      { id: 'biz-7', label: '🚀 Estoy empezando', value: 'Estoy empezando un negocio' },
      { id: 'biz-8', label: '✏️ Otro tipo de negocio', value: 'Otro' },
    ],
  },

  // Step 3 — Main problem
  {
    step: 'main-problem',
    messages: [
      '¿Qué es lo que más te está frenando o quitando tiempo actualmente?',
    ],
    answerKey: 'mainProblem',
    allowFreeText: true,
    inputPlaceholder: 'Cuéntame tu principal reto...',
    quickReplies: [
      { id: 'prob-1', label: '🌐 No tengo página web', value: 'No tengo página web' },
      { id: 'prob-2', label: '📉 Mi página no me ayuda a vender', value: 'Tengo página web, pero no me ayuda a vender' },
      { id: 'prob-3', label: '💬 Pierdo tiempo respondiendo mensajes', value: 'Pierdo tiempo respondiendo mensajes' },
      { id: 'prob-4', label: '📋 Me cuesta organizar pedidos y clientes', value: 'Me cuesta organizar pedidos y clientes' },
      { id: 'prob-5', label: '🔁 Hago muchas tareas manualmente', value: 'Hago muchas tareas manualmente' },
      { id: 'prob-6', label: '📈 Quiero vender más por internet', value: 'Quiero vender más por internet' },
      { id: 'prob-7', label: '⚙️ Necesito un sistema para mi empresa', value: 'Necesito un sistema para mi empresa' },
      { id: 'prob-8', label: '✏️ Otro problema', value: 'Otro problema' },
    ],
  },

  // Step 4 — Scope
  {
    step: 'scope',
    messages: [
      '¿Qué tipo de solución tienes en mente para tu negocio?',
    ],
    answerKey: 'scope',
    allowFreeText: false,
    quickReplies: [
      { id: 'scope-1', label: '🌐 Landing Page profesional (menos de $270 USD)', value: 'Landing Page profesional' },
      { id: 'scope-2', label: '📱 Catálogo editable + Panel + Pedidos WhatsApp ($320 USD)', value: 'Catálogo editable con panel y pedidos por WhatsApp' },
      { id: 'scope-3', label: '🛒 Tienda online completa con pagos', value: 'Tienda online completa con pagos' },
      { id: 'scope-4', label: '🤖 Automatizaciones e IA para mensajes', value: 'Automatizaciones e IA para mensajes' },
      { id: 'scope-5', label: '⚙️ Sistema personalizado a medida', value: 'Sistema personalizado a medida' },
      { id: 'scope-6', label: '🔍 Quiero que me recomiendes la mejor opción', value: 'Quiero que me asesores' },
    ],
  },

  // Step 5 — Budget
  {
    step: 'budget',
    messages: [
      'Para ofrecerte la mejor propuesta, ¿cuál es tu rango de presupuesto estimado?',
    ],
    answerKey: 'budget',
    allowFreeText: false,
    quickReplies: [
      { id: 'bud-1', label: '💵 Menos de $270 USD (Landing Page)', value: 'Menos de $270 USD' },
      { id: 'bud-2', label: '💵 $270 – $350 USD (Catálogo + Panel WhatsApp)', value: '$270 – $350 USD' },
      { id: 'bud-3', label: '💵 $350 – $600 USD (Tienda Online)', value: '$350 – $600 USD' },
      { id: 'bud-4', label: '💵 Más de $600 USD (IA / Sistema a Medida)', value: 'Más de $600 USD' },
      { id: 'bud-5', label: '🤔 Aún no tengo presupuesto definido', value: 'Todavía no tengo un presupuesto definido' },
      { id: 'bud-6', label: '🔍 Busco conocer las opciones disponibles', value: 'Quiero conocer las opciones primero' },
    ],
  },

  // Step 6 — Urgency
  {
    step: 'urgency',
    messages: [
      '¿Cuándo te gustaría tener funcionando esta solución?',
    ],
    answerKey: 'urgency',
    allowFreeText: false,
    quickReplies: [
      { id: 'urg-1', label: '🔥 Lo antes posible', value: 'Lo antes posible' },
      { id: 'urg-2', label: '📅 En las próximas semanas', value: 'En las próximas semanas' },
      { id: 'urg-3', label: '📆 En el próximo mes', value: 'En el próximo mes' },
      { id: 'urg-4', label: '🔍 Estoy explorando opciones', value: 'Estoy explorando opciones' },
      { id: 'urg-5', label: '⏳ Sin fecha definida', value: 'No tengo una fecha definida' },
    ],
  },
];

// Thinking messages that Samuel shows while "processing"
export const SAMUEL_THINKING_MESSAGES = [
  'Perfecto, entendido...',
  'Tiene sentido, déjame procesar eso...',
  'Excelente, siguiendo con algo importante...',
  'Genial, esto me ayuda a entender mejor...',
  'Bien, continuemos...',
];

// Transition messages between steps
export const STEP_TRANSITIONS: Partial<Record<DiagnosisStep, string>> = {
  'business-type': '¡Excelente! Ahora cuéntame:',
  'main-problem': 'Perfecto. Para recomendarte la mejor opción:',
  'scope': '¡Bien! Casi terminamos. Dime:',
  'budget': 'Muy bien. Una pregunta importante sobre presupuesto:',
  'urgency': '¡Casi listo! Solo una última cosa:',
};

// Result reveal messages
export const RESULT_REVEAL_MESSAGES = [
  'Ya analicé todo lo que me contaste... 🧠',
  '¡Ya tengo una recomendación clara para ti!',
];

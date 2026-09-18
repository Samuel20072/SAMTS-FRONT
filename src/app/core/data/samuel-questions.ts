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
  // Step 1 — Business type
  {
    step: 'business-type',
    messages: ['¡Empecemos! Cuéntame, ¿qué tipo de negocio tienes?'],
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

  // Step 2 — Main problem
  {
    step: 'main-problem',
    messages: [
      'Perfecto. Ahora quiero entender algo importante: ¿qué es lo que más te está frenando actualmente?',
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

  // Step 3 — Repetitive tasks
  {
    step: 'repetitive-tasks',
    messages: [
      '¿Qué tareas haces una y otra vez que te gustaría dejar de hacer manualmente?',
    ],
    answerKey: 'repetitiveTasks',
    allowFreeText: true,
    inputPlaceholder: 'Ej. Responder preguntas de precios por WhatsApp...',
    quickReplies: [
      { id: 'task-1', label: '💬 Responder preguntas de clientes', value: 'Responder preguntas de clientes' },
      { id: 'task-2', label: '📸 Enviar catálogos y precios', value: 'Enviar catálogos y precios' },
      { id: 'task-3', label: '📝 Registrar pedidos', value: 'Registrar pedidos' },
      { id: 'task-4', label: '📦 Organizar inventario', value: 'Organizar inventario' },
      { id: 'task-5', label: '👥 Gestionar clientes', value: 'Gestionar clientes' },
      { id: 'task-6', label: '📣 Crear contenido y promociones', value: 'Crear contenido y promociones' },
      { id: 'task-7', label: '📊 Generar reportes', value: 'Generar reportes' },
      { id: 'task-8', label: '✅ No tengo tareas repetitivas', value: 'No tengo tareas repetitivas' },
    ],
  },

  // Step 4 — Goal
  {
    step: 'goal',
    messages: [
      '¿Qué te gustaría conseguir con una solución digital?',
    ],
    answerKey: 'goal',
    allowFreeText: false,
    quickReplies: [
      { id: 'goal-1', label: '🖼️ Mostrar mis productos profesionalmente', value: 'Mostrar mis productos de forma profesional' },
      { id: 'goal-2', label: '🛒 Recibir pedidos por internet', value: 'Recibir pedidos por internet' },
      { id: 'goal-3', label: '💳 Recibir pagos online', value: 'Recibir pagos online' },
      { id: 'goal-4', label: '⏱️ Ahorrar tiempo', value: 'Ahorrar tiempo' },
      { id: 'goal-5', label: '🤖 Automatizar procesos', value: 'Automatizar procesos' },
      { id: 'goal-6', label: '📂 Organizar mejor mi empresa', value: 'Organizar mejor mi empresa' },
      { id: 'goal-7', label: '⚙️ Crear un sistema personalizado', value: 'Crear un sistema personalizado' },
      { id: 'goal-8', label: '📈 Escalar mi negocio', value: 'Escalar mi negocio' },
    ],
  },

  // Step 5 — Scope
  {
    step: 'scope',
    messages: [
      '¿Qué tan completa te gustaría que fuera la solución?',
    ],
    answerKey: 'scope',
    allowFreeText: false,
    quickReplies: [
      { id: 'scope-1', label: '🌱 Algo sencillo para empezar', value: 'Algo sencillo para empezar' },
      { id: 'scope-2', label: '💻 Una página web profesional', value: 'Una página web profesional' },
      { id: 'scope-3', label: '📱 Catálogo con pedidos por WhatsApp', value: 'Catálogo con pedidos por WhatsApp' },
      { id: 'scope-4', label: '🛒 Una tienda online completa', value: 'Una tienda online completa' },
      { id: 'scope-5', label: '🤖 Automatizaciones para mi negocio', value: 'Automatizaciones para mi negocio' },
      { id: 'scope-6', label: '⚙️ Sistema personalizado para mi empresa', value: 'Sistema personalizado para mi empresa' },
      { id: 'scope-7', label: '🔍 Quiero explorar opciones', value: 'Quiero explorar opciones' },
    ],
  },

  // Step 6 — Budget
  {
    step: 'budget',
    messages: [
      'Para recomendarte algo que tenga sentido para tu negocio, ¿tienes una idea del presupuesto que puedes invertir?',
    ],
    answerKey: 'budget',
    allowFreeText: false,
    quickReplies: [
      { id: 'bud-1', label: '💵 Menos de $1.000.000 COP', value: 'Menos de $1.000.000 COP' },
      { id: 'bud-2', label: '💵 $1.000.000 – $3.000.000 COP', value: '$1.000.000 – $3.000.000 COP' },
      { id: 'bud-3', label: '💵 $3.000.000 – $6.000.000 COP', value: '$3.000.000 – $6.000.000 COP' },
      { id: 'bud-4', label: '💵 Más de $6.000.000 COP', value: 'Más de $6.000.000 COP' },
      { id: 'bud-5', label: '🤔 Sin presupuesto definido aún', value: 'Todavía no tengo un presupuesto' },
      { id: 'bud-6', label: '🔍 Quiero conocer las opciones primero', value: 'Quiero conocer las opciones primero' },
    ],
  },

  // Step 7 — Urgency
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
  'main-problem': '¡Excelente! Ahora quiero entender algo importante:',
  'repetitive-tasks': 'Entendido. Déjame preguntarte algo más específico:',
  'goal': '¡Perfecto! Eso me da mucho contexto. Ahora dime:',
  'scope': '¡Bien! Casi terminamos. Dime:',
  'budget': 'Muy bien. Una última pregunta antes de mostrarte mi recomendación:',
  'urgency': '¡Casi listo! Solo una cosa más:',
};

// Result reveal messages
export const RESULT_REVEAL_MESSAGES = [
  'Ya analicé todo lo que me contaste... 🧠',
  '¡Ya tengo una recomendación clara para ti!',
];

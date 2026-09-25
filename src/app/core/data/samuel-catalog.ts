/* ═══════════════════════════════════════════════════════════
   Samuel AI — SAMTS Service Catalog & Recommendation Engine
   Prices in USD ($) and intelligent proposal diagnosis.
   ═══════════════════════════════════════════════════════════ */

import { SolutionPlan, SolutionId } from '../models/samuel.models';

export const SAMTS_CATALOG: SolutionPlan[] = [
  {
    id: 'landing',
    name: 'Página Web Startup / Landing Page',
    tagline: 'Tu presencia digital profesional y de alto impacto',
    description:
      'Una landing page moderna, ultrarrápida y optimizada para posicionar tu marca, transmitir confianza y captar clientes potenciales desde el primer día.',
    problem: 'No tienes página web o tu sitio actual no genera clientes ni transmite profesionalismo.',
    features: [
      'Diseño web premium y responsivo (5 secciones de impacto)',
      'Optimización de velocidad y SEO para Google',
      'Botones de contacto directo a WhatsApp y llamadas',
      'Formulario inteligente de captación de clientes',
      'Hosting y dominio gratis por 1 año',
      'Soporte técnico y garantía de 30 días',
    ],
    price: '$249 USD',
    priceNote: 'Pago único · Entrega en 7 a 10 días',
    ctaPrimary: 'Quiero mi Landing Page ($249)',
    ctaSecondary: 'Ver catálogo con panel ($320)',
    highlight: false,
    demoType: 'landing',
  },
  {
    id: 'catalog',
    name: 'Landing con Catálogo Editable + Pedidos WhatsApp',
    tagline: 'Muestra tus productos, recibe pedidos automáticos y edita con panel admin',
    description:
      'Tu vitrina digital interactiva donde tus clientes arman su pedido y te llega listo a WhatsApp. Incluye panel administrativo fácil para que cambies fotos, precios y disponibilidad en segundos sin depender de nadie.',
    problem: 'Pierdes horas respondiendo precios, fotos y stock uno por uno por WhatsApp o Instagram.',
    features: [
      'Catálogo interactivo con fotos, precios y categorías',
      'Panel de control administrativo para editar productos y precios tú mismo',
      'Generador de pedidos automático formateado directo a tu WhatsApp',
      'Buscador y filtros de productos en tiempo real',
      'Diseño ultra-optimizado para móviles y redes sociales',
      'Hosting y dominio gratis por 1 año',
      'Video-capacitación para gestionar tu catálogo',
    ],
    price: '$320 USD',
    priceNote: 'Pago único · Entrega en 10 a 14 días',
    ctaPrimary: 'Quiero mi Catálogo + Panel ($320)',
    ctaSecondary: 'Ver tienda online con pagos ($590)',
    highlight: true,
    demoType: 'boutique',
  },
  {
    id: 'ecommerce',
    name: 'Tienda Online Completa Pro',
    tagline: 'Vende 24/7 con carrito de compras y pasarelas de pago',
    description:
      'Tu plataforma de comercio electrónico integral. Tus clientes eligen, compran y pagan online automáticamente con tarjeta o transferencia mientras tú controlas pedidos e inventario.',
    problem: 'Quieres automatizar las ventas de tu negocio y recibir pagos sin depender de la atención manual.',
    features: [
      'Todo lo del Catálogo Editable',
      'Carrito de compras y pasarelas de pago online (Tarjetas, PSE, PayPal)',
      'Gestión automática de inventario, stock y alertas',
      'Panel de ventas con métricas, clientes y facturación',
      'Notificaciones automáticas por WhatsApp y correo',
      'Soporte VIP y acompañamiento 3 meses',
    ],
    price: '$590 USD',
    priceNote: 'Pago único · Entrega en 2 a 3 semanas',
    ctaPrimary: 'Quiero mi Tienda Online ($590)',
    ctaSecondary: 'Ver opción de automatización con IA',
    highlight: false,
    demoType: 'ecommerce',
  },
  {
    id: 'ai-pro',
    name: 'Neural AI Pro & Automatización',
    tagline: 'IA que atiende, califica leads y automatiza tus procesos',
    description:
      'Tu negocio vende y atiende en piloto automático. Chatbot con Inteligencia Artificial entrenado con los datos de tu empresa que responde dudas, califica prospectos y agenda citas 24/7.',
    problem: 'Muchas tareas repetitivas y atención al cliente que te consumen tiempo valioso.',
    features: [
      'Web o Catálogo con Chatbot IA 24/7 integrado',
      'Entrenamiento de IA con tus productos, servicios y políticas',
      'Automatización de respuestas en WhatsApp y redes',
      'Dashboard con analítica de conversaciones y leads calificados',
      'Integración con CRM, bases de datos o Google Sheets',
      'Soporte prioritario y optimizaciones continuas',
    ],
    price: '$790 USD',
    priceNote: 'Pago único · Entrega en 3 semanas',
    ctaPrimary: 'Quiero automatizar mi negocio ($790)',
    ctaSecondary: 'Ver opciones a medida',
    highlight: true,
    demoType: 'dashboard',
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Sistemas a Medida',
    tagline: 'Software y arquitectura personalizada para tu empresa',
    description:
      'Desarrollo de software y plataformas empresariales adaptadas exactamente a la operativa de tu empresa: módulos personalizados, integraciones ERP/CRM y arquitectura en la nube escalable.',
    problem: 'Tu empresa requiere un sistema interno exclusivo, flujos complejos o integraciones avanzadas.',
    features: [
      'Arquitectura cloud segura y de alta disponibilidad',
      'Paneles administrativos multi-rol y multi-sucursal',
      'Integración con ERPs, CRMs, APIs y bases de datos',
      'Agentes de IA especializados y automatizaciones de flujos',
      'Acuerdo de nivel de servicio (SLA) y soporte dedicado',
    ],
    price: 'A Medida (Desde $1,200 USD)',
    priceNote: 'Cotización personalizada según requerimientos',
    ctaPrimary: 'Hablar con un especialista',
    ctaSecondary: 'Ver planes estándar',
    highlight: false,
    demoType: 'dashboard',
  },
  {
    id: 'starter-kit' as any,
    name: 'Consultoría y Diagnóstico Estratégico',
    tagline: 'El mejor punto de partida sin costo',
    description:
      'Sesión 1 a 1 de 30 minutos con un especialista tecnológico de SAMTS para revisar tu modelo de negocio y definir el paso digital más rentable según tus objetivos.',
    problem: 'Necesitas orientación clara antes de definir tu presupuesto o estás en fase inicial.',
    features: [
      'Sesión estratégica personalizada (30 min)',
      'Diagnóstico digital de oportunidades para tu sector',
      'Hoja de ruta recomendada por fases',
      'Cotización flexible adaptada a tu presupuesto',
      '100% sin compromiso',
    ],
    price: '¡GRATIS!',
    priceNote: 'Sin costo · $0 USD',
    ctaPrimary: 'Agendar diagnóstico gratuito',
    ctaSecondary: 'Ver catálogo de soluciones',
    highlight: true,
    demoType: 'landing',
  },
];

const STARTER_KIT_ID = 'starter-kit';

// ─── Intelligent Recommendation Engine ────────────────────────

interface RecommendationRule {
  solutionId: SolutionId;
  priceUSD: number;
  score: (answers: {
    businessType?: string;
    mainProblem?: string;
    repetitiveTasks?: string;
    goal?: string;
    scope?: string;
    budget?: string;
    rawText?: string;
  }) => number;
}

/** Map budget string → numeric ceiling in USD */
function getBudgetCeiling(budget?: string): number {
  if (!budget) return Infinity;
  const b = budget.toLowerCase();
  if (b.includes('menos de') || b.includes('270')) return 270;
  if (b.includes('350')) return 350;
  if (b.includes('600')) return 600;
  if (b.includes('más de') || b.includes('mas de')) return Infinity;
  return Infinity;
}

/** Extracts keywords from all answer strings */
function extractTokens(answers: Record<string, string | undefined>): string {
  return Object.values(answers)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const RULES: RecommendationRule[] = [
  // 1. Landing Page Startup ($249 USD - Less than $270 USD)
  {
    solutionId: 'landing',
    priceUSD: 249,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (text.includes('landing') || text.includes('página web profesional') || text.includes('presencia')) s += 40;
      if (text.includes('no tengo página') || text.includes('no tengo web')) s += 35;
      if (text.includes('algo sencillo') || text.includes('empezar')) s += 30;
      if (text.includes('menos de $270') || text.includes('249') || text.includes('270')) s += 35;
      if (text.includes('servicios') || text.includes('marca') || text.includes('consultor') || text.includes('profesional')) s += 15;
      return s;
    },
  },

  // 2. Catalog Editable + Admin Panel + WhatsApp Orders ($320 USD)
  {
    solutionId: 'catalog',
    priceUSD: 320,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      // High intent for catalog, whatsapp, editable panel, products, boutique, restaurant
      if (text.includes('catálogo') || text.includes('catalogo') || text.includes('panel') || text.includes('editable')) s += 50;
      if (text.includes('whatsapp') && (text.includes('pedido') || text.includes('orden') || text.includes('producto') || text.includes('foto') || text.includes('precio'))) s += 45;
      if (text.includes('ropa') || text.includes('boutique') || text.includes('restaurante') || text.includes('comida') || text.includes('barbería') || text.includes('productos')) s += 30;
      if (text.includes('fotos') || text.includes('precios') || text.includes('organizar pedidos')) s += 35;
      if (text.includes('320') || text.includes('270 – 350') || text.includes('350')) s += 35;
      if (text.includes('vender mis productos') || text.includes('vender por internet')) s += 25;
      return s;
    },
  },

  // 3. Tienda Online Completa con Pagos ($590 USD)
  {
    solutionId: 'ecommerce',
    priceUSD: 590,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (text.includes('tienda online completa') || text.includes('ecommerce') || text.includes('e-commerce') || text.includes('carrito')) s += 50;
      if (text.includes('pasarela') || text.includes('tarjeta') || text.includes('pagar') || text.includes('pagos online') || text.includes('recibir pagos')) s += 45;
      if (text.includes('350 – 600') || text.includes('600')) s += 25;
      if (text.includes('inventario') || text.includes('stock')) s += 20;
      return s;
    },
  },

  // 4. Neural AI Pro ($790 USD)
  {
    solutionId: 'ai-pro',
    priceUSD: 790,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (text.includes('automatizar') || text.includes('automatizaciones') || text.includes('ia') || text.includes('inteligencia artificial') || text.includes('bot') || text.includes('chatbot')) s += 50;
      if (text.includes('manualmente') || text.includes('repetitivas') || text.includes('responder mensajes') || text.includes('tiempo respondiendo')) s += 40;
      if (text.includes('calificar leads') || text.includes('crm') || text.includes('24/7')) s += 30;
      if (text.includes('más de 600') || text.includes('más de $600')) s += 25;
      return s;
    },
  },

  // 5. Enterprise & Medida
  {
    solutionId: 'enterprise',
    priceUSD: 1200,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (text.includes('sistema personalizado') || text.includes('empresa mediana') || text.includes('empresa grande') || text.includes('software a medida')) s += 55;
      if (text.includes('sucursales') || text.includes('erp') || text.includes('integración') || text.includes('multi')) s += 40;
      if (text.includes('sistema para mi empresa') || text.includes('escalar')) s += 35;
      return s;
    },
  },
];

export function getRecommendation(answers: {
  businessType?: string;
  mainProblem?: string;
  repetitiveTasks?: string;
  goal?: string;
  scope?: string;
  budget?: string;
}): { primary: SolutionPlan; alternatives: SolutionPlan[] } {
  const ceiling = getBudgetCeiling(answers.budget);
  const text = extractTokens(answers);

  // If client explicitly indicated free consultation or has no budget at all and wants guidance
  const freePlan = SAMTS_CATALOG.find((p) => (p.id as string) === STARTER_KIT_ID)!;
  if ((text.includes('gratis') || text.includes('sin dinero')) && freePlan) {
    const alternatives = SAMTS_CATALOG.filter((p) => p.id === 'landing' || p.id === 'catalog');
    return { primary: freePlan, alternatives };
  }

  const scored = RULES.map((rule) => {
    let score = rule.score(answers);
    const plan = SAMTS_CATALOG.find((p) => p.id === rule.solutionId)!;

    // Budget fit bonus/penalty
    if (ceiling !== Infinity) {
      if (rule.priceUSD <= ceiling) {
        score += 25; // Bonus for fitting budget cleanly
      } else {
        score -= 80; // Penalty when exceeding specified budget
      }
    }

    return {
      solution: plan,
      score,
      withinBudget: rule.priceUSD <= ceiling,
    };
  }).sort((a, b) => b.score - a.score);

  const primary = scored[0].solution;
  const alternatives = scored
    .slice(1, 4)
    .filter((s) => s.solution.id !== primary.id)
    .map((s) => s.solution);

  return { primary, alternatives };
}

/** Build an intelligent, personalized explanation based on answers */
export function buildReasoning(
  answers: { businessType?: string; mainProblem?: string; goal?: string; scope?: string },
  primary: SolutionPlan
): string {
  const biz = answers.businessType ? `tu negocio (${answers.businessType})` : 'tu negocio';

  if (primary.id === 'catalog') {
    return `Para ${biz}, el Catálogo Editable ($320 USD) te permite mostrar productos actualizados, recibir pedidos directos a WhatsApp y editar precios tú mismo con panel de control.`;
  }
  if (primary.id === 'landing') {
    return `Para ${biz}, la Landing Page Startup ($249 USD) te dará presencia profesional de alto impacto en Google y redes por menos de $270 USD.`;
  }
  if (primary.id === 'ecommerce') {
    return `Para ${biz}, la Tienda Online ($590 USD) te permitirá automatizar ventas 24/7 con carrito y pasarela de pagos integrada.`;
  }
  if (primary.id === 'ai-pro') {
    return `Para ${biz}, Neural AI Pro ($790 USD) automatiza la atención 24/7, califica prospectos y responde clientes al instante en WhatsApp.`;
  }
  if (primary.id === 'enterprise') {
    return `Para ${biz}, diseñamos software a medida según los flujos y módulos exclusivos de tu empresa.`;
  }
  return `Propuesta diseñada para que ${biz} logre el máximo retorno con tecnología moderna y fácil de usar.`;
}

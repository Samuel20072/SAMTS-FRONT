/* ═══════════════════════════════════════════════════════════
   Samuel AI — SAMTS Service Catalog
   Real services and pricing from the official catalog.
   DO NOT invent services or prices not reflected here.
   ═══════════════════════════════════════════════════════════ */

import { SolutionPlan } from '../models/samuel.models';

export const SAMTS_CATALOG: SolutionPlan[] = [
  {
    id: 'landing',
    name: 'Página Web Startup',
    tagline: 'Tu presencia digital profesional',
    description:
      'Un sitio web moderno, rápido y optimizado para mostrar tu negocio, captar clientes y diferenciarte de la competencia.',
    problem: 'No tienes presencia digital o tu página actual no te ayuda a vender.',
    features: [
      'Diseño web premium (5 secciones)',
      'Optimización móvil y SEO básico',
      'Formularios de contacto avanzados',
      'Soporte técnico 1 mes',
      'Hosting gratis por 1 año',
    ],
    price: '$1.490.000 COP',
    priceNote: 'Pago único · Entrega en 2 semanas',
    ctaPrimary: 'Quiero mi página web',
    ctaSecondary: 'Ver opciones más completas',
    highlight: false,
    demoType: 'landing',
  },
  {
    id: 'catalog',
    name: 'Catálogo Digital + WhatsApp',
    tagline: 'Muestra tus productos, recibe pedidos',
    description:
      'Una página diseñada para que tus clientes puedan explorar tus productos, conocer precios y contactarte fácilmente por WhatsApp para realizar pedidos.',
    problem: 'Pierdes tiempo enviando fotos, precios y catálogos por WhatsApp o Instagram.',
    features: [
      'Catálogo de productos con categorías',
      'Galería de imágenes optimizada',
      'Diseño adaptado a tu marca',
      'Botones de pedido directo por WhatsApp',
      'Integración con Instagram',
      'Optimización móvil completa',
      'Hosting gratis por 1 año',
    ],
    price: '$1.490.000 COP',
    priceNote: 'Pago único · Entrega en 2 semanas',
    ctaPrimary: 'Quiero mi catálogo digital',
    ctaSecondary: 'Ver tienda online completa',
    highlight: false,
    demoType: 'boutique',
  },
  {
    id: 'ecommerce',
    name: 'Tienda Online Completa',
    tagline: 'Vende 24/7, recibe pagos online',
    description:
      'Tu tienda en internet con carrito de compras, pagos online y gestión de pedidos. Tus clientes compran solos, en cualquier momento.',
    problem: 'Quieres vender online y recibir pagos sin depender de WhatsApp.',
    features: [
      'Todo lo del plan Startup',
      'Catálogo de productos ilimitado',
      'Carrito de compras y checkout',
      'Pasarelas de pago integradas (Wompi/PayU)',
      'Gestión de inventario',
      'Panel de administración',
      'Chatbot IA entrenado con tus datos',
      'Generación automática de leads',
      'Soporte VIP 3 meses',
    ],
    price: '$3.890.000 COP',
    priceNote: 'Pago único · Entrega en 3 semanas',
    ctaPrimary: 'Quiero mi tienda online',
    ctaSecondary: 'Ver plan más económico',
    highlight: true,
    demoType: 'ecommerce',
  },
  {
    id: 'ai-pro',
    name: 'Neural AI Pro',
    tagline: 'Automatización total con IA integrada',
    description:
      'Tu negocio vende, califica leads y crece solo. IA integrada que responde clientes, genera contenido y automatiza procesos clave de forma inteligente.',
    problem: 'Haces muchas tareas manualmente que podrían automatizarse con IA.',
    features: [
      'Todo lo del plan Startup',
      'Chatbot IA entrenado con tus datos',
      'E-commerce + pasarelas de pago',
      'Generación automática de leads',
      'Dashboard administrativo completo',
      'Automatización de WhatsApp y redes',
      'Soporte VIP 3 meses',
    ],
    price: '$4.990.000 COP',
    priceNote: 'Pago único · Entrega en 3 semanas',
    ctaPrimary: 'Quiero automatizar mi negocio',
    ctaSecondary: 'Comparar opciones',
    highlight: true,
    demoType: 'dashboard',
  },
  {
    id: 'enterprise',
    name: 'Enterprise a Medida',
    tagline: 'Sistemas personalizados para tu empresa',
    description:
      'Construimos sistemas web adaptados exactamente a la forma en que trabaja tu empresa: flujos personalizados, integraciones y arquitectura escalable.',
    problem: 'Tu empresa necesita un sistema propio o integraciones complejas que no existen en el mercado.',
    features: [
      'Arquitectura en la nube escalable',
      'Panel administrativo a medida',
      'Módulos y flujos personalizados',
      'Integración con ERPs y CRMs',
      'Agentes IA multicanal (WhatsApp, Web)',
      'Automatizaciones avanzadas',
      'Modelos de IA propios (RAG)',
      'Reportes y analítica',
      'SLA 99.9% uptime',
    ],
    price: 'A Medida (COP)',
    priceNote: 'Precio según alcance · Cotización personalizada',
    ctaPrimary: 'Hablar con un especialista',
    ctaSecondary: 'Ver opciones más pequeñas',
    highlight: false,
    demoType: 'dashboard',
  },
];

// ─── Recommendation Engine ────────────────────────────────────────────────────

interface RecommendationRule {
  /** Function that scores this solution for given answers (higher = better match) */
  score: (answers: {
    businessType?: string;
    mainProblem?: string;
    repetitiveTasks?: string;
    goal?: string;
    scope?: string;
    budget?: string;
  }) => number;
  solutionId: import('../models/samuel.models').SolutionId;
}

const RULES: RecommendationRule[] = [
  // Landing / Startup — no website, needs visibility
  {
    solutionId: 'landing',
    score: ({ mainProblem, goal, budget, scope }) => {
      let s = 0;
      if (mainProblem?.includes('No tengo página')) s += 30;
      if (goal?.includes('Mostrar mis productos')) s += 20;
      if (scope?.includes('sencillo') || scope?.includes('Algo sencillo')) s += 20;
      if (budget?.includes('Menos de') || budget?.includes('1.000.000')) s += 15;
      return s;
    },
  },
  // Catalog — sending photos/prices on WhatsApp
  {
    solutionId: 'catalog',
    score: ({ mainProblem, repetitiveTasks, goal, businessType, scope }) => {
      let s = 0;
      if (repetitiveTasks?.includes('catálogo') || repetitiveTasks?.includes('fotos') || repetitiveTasks?.includes('precios')) s += 30;
      if (mainProblem?.includes('respondo mensajes') || mainProblem?.includes('tiempo')) s += 20;
      if (businessType?.includes('ropa') || businessType?.includes('boutique') || businessType?.includes('productos')) s += 20;
      if (goal?.includes('Mostrar mis productos')) s += 20;
      if (scope?.includes('catálogo')) s += 25;
      return s;
    },
  },
  // Ecommerce — wants to sell online, receive payments
  {
    solutionId: 'ecommerce',
    score: ({ goal, scope, mainProblem, budget }) => {
      let s = 0;
      if (goal?.includes('Recibir pedidos')) s += 25;
      if (goal?.includes('Recibir pagos')) s += 30;
      if (scope?.includes('tienda online')) s += 35;
      if (mainProblem?.includes('vender más por internet')) s += 20;
      if (budget?.includes('3.000.000') || budget?.includes('6.000.000') || budget?.includes('Más de')) s += 15;
      return s;
    },
  },
  // AI Pro — automations, repetitive tasks, save time
  {
    solutionId: 'ai-pro',
    score: ({ repetitiveTasks, goal, mainProblem, scope }) => {
      let s = 0;
      if (goal?.includes('Ahorrar tiempo') || goal?.includes('Automatizar')) s += 30;
      if (mainProblem?.includes('manualmente') || mainProblem?.includes('repetitivas')) s += 25;
      if (repetitiveTasks && !repetitiveTasks.includes('No tengo')) s += 20;
      if (scope?.includes('Automatizaciones')) s += 35;
      return s;
    },
  },
  // Enterprise — big company, complex systems, integrations
  {
    solutionId: 'enterprise',
    score: ({ businessType, scope, budget, goal }) => {
      let s = 0;
      if (businessType?.includes('Empresa mediana') || businessType?.includes('grande')) s += 35;
      if (scope?.includes('sistema personalizado')) s += 40;
      if (goal?.includes('sistema personalizado') || goal?.includes('Escalar')) s += 20;
      if (budget?.includes('Más de')) s += 20;
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
  const scored = RULES.map((rule) => ({
    solution: SAMTS_CATALOG.find((p) => p.id === rule.solutionId)!,
    score: rule.score(answers),
  })).sort((a, b) => b.score - a.score);

  const primary = scored[0].solution;
  const alternatives = scored
    .slice(1, 3)
    .filter((s) => s.solution.id !== primary.id)
    .map((s) => s.solution);

  return { primary, alternatives };
}

/** Build a personalized explanation based on answers */
export function buildReasoning(
  answers: { businessType?: string; mainProblem?: string; goal?: string },
  primary: SolutionPlan
): string {
  const biz = answers.businessType || 'tu negocio';
  const problem = answers.mainProblem || '';
  const goal = answers.goal || '';

  if (primary.id === 'catalog') {
    return `Basado en lo que me contaste, ${biz} está perdiendo tiempo enviando fotos y precios manualmente. Con un catálogo digital conectado a WhatsApp, tus clientes pueden explorar tus productos solos y contactarte listos para comprar.`;
  }
  if (primary.id === 'ecommerce') {
    return `${biz} está listo para vender online. Con una tienda completa, tus clientes pueden hacer pedidos y pagar directamente, sin que tengas que responder cada uno manualmente.`;
  }
  if (primary.id === 'ai-pro') {
    return `Detecté que ${biz} tiene procesos que se repiten constantemente. Con IA integrada, puedes automatizar esas tareas y liberar tiempo para enfocarte en crecer.`;
  }
  if (primary.id === 'enterprise') {
    return `Para una empresa de tu tamaño, necesitas una solución construida exactamente para tu forma de trabajar. Un sistema a medida que se adapte a tus procesos, no al revés.`;
  }
  return `Según lo que me contaste, esta es la solución que mejor se adapta a lo que necesitas ahora mismo. Puede crecer con tu negocio conforme evolucionen tus necesidades.`;
}

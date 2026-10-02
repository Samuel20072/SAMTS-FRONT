import { SolutionPlan, SolutionId } from '../models/samuel.models';

export const SAMTS_CATALOG: SolutionPlan[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    tagline: 'Tu presencia digital profesional y de alto impacto',
    description:
      'Presencia digital moderna y optimizada para captar clientes potenciales desde el primer dia.',
    problem: 'No tienes pagina web o tu sitio actual no genera clientes ni transmite profesionalismo.',
    features: [
      'Diseño premium',
      'Responsive',
      'Formulario de contacto',
      'Botón de WhatsApp',
      'SEO básico',
      'Hosting',
    ],
    price: '$900.000 COP ($225 USD)',
    priceNote: 'Pago único · Entrega en 7 a 10 días',
    ctaPrimary: 'Quiero mi Landing Page ($900.000 COP / $225 USD)',
    ctaSecondary: 'Ver Sitio Web Profesional',
    highlight: false,
    demoType: 'landing',
  },
  {
    id: 'catalog',
    name: 'Sitio Web Profesional',
    tagline: 'Múltiples páginas, blog y panel administrativo para tu empresa',
    description:
      'Plataforma completa para posicionar tu marca con varias páginas, sección de blog, formularios avanzados y panel administrativo (si aplica).',
    problem: 'Pierdes ventas o clientes por no contar con una plataforma web estructurada y profesional.',
    features: [
      'Varias páginas',
      'Blog',
      'Diseño personalizado',
      'SEO básico',
      'Formularios avanzados',
      'Panel administrativo (si aplica)',
    ],
    price: '$2.500.000 COP ($625 USD)',
    priceNote: 'Pago único · Entrega en 10 a 14 días',
    ctaPrimary: 'Quiero mi Sitio Web Profesional ($2.500.000 COP / $625 USD)',
    ctaSecondary: 'Ver Soluciones Personalizadas',
    highlight: true,
    demoType: 'boutique',
  },
  {
    id: 'enterprise',
    name: 'Soluciones Personalizadas',
    tagline: 'Plataformas, e-commerce avanzado, automatizaciones e integraciones con IA',
    description:
      'Ecosistemas digitales complejos a medida: sistemas administrativos, plataformas web, tiendas en línea avanzadas y herramientas con Inteligencia Artificial. El valor final depende de los requerimientos específicos del proyecto.',
    problem: 'Tu empresa requiere un sistema exclusivo, flujos complejos o integraciones avanzadas.',
    features: [
      'Plataformas web y sistemas administrativos',
      'E-commerce avanzado e integraciones de pago',
      'Automatizaciones e Inteligencia Artificial',
      'Integración con CRM, ERPs y bases de datos',
      'Arquitectura en la nube y alta disponibilidad',
    ],
    price: 'Desde $4.000.000 COP ($1.000 USD)',
    priceNote: 'Pago único · Cotización según requerimientos',
    ctaPrimary: 'Cotizar Solución Personalizada',
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
    priceNote: 'Sin costo · $0 USD / $0 COP',
    ctaPrimary: 'Agendar diagnóstico gratuito',
    ctaSecondary: 'Ver catálogo de soluciones',
    highlight: true,
    demoType: 'landing',
  },
];

const STARTER_KIT_ID = 'starter-kit';

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

function getBudgetCeiling(budget?: string): number {
  if (!budget) return Infinity;
  const b = budget.toLowerCase();
  if (b.includes('menos de') || b.includes('900') || b.includes('225')) return 225;
  if (b.includes('2.500') || b.includes('625')) return 625;
  if (b.includes('4.000') || b.includes('1.000') || b.includes('1000')) return 1000;
  if (b.includes('más de') || b.includes('mas de')) return Infinity;
  return Infinity;
}

function extractTokens(answers: Record<string, string | undefined>): string {
  return Object.values(answers)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const RULES: RecommendationRule[] = [
  {
    solutionId: 'landing',
    priceUSD: 225,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (answers.scope?.includes('Landing Page')) s += 250;
      if (answers.goal?.includes('página web') || answers.goal?.includes('presencia')) s += 80;
      if (answers.mainProblem?.includes('No tengo página web')) s += 60;
      if (answers.mainProblem?.includes('no me ayuda a vender')) s += 30;
      if (answers.businessType?.includes('servicios') || answers.businessType?.includes('empezando') || answers.businessType?.includes('Otro')) s += 40;
      if (text.includes('landing') || text.includes('sencillo') || text.includes('225') || text.includes('900.000')) s += 25;
      return s;
    },
  },
  {
    solutionId: 'catalog',
    priceUSD: 625,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (answers.scope?.includes('Sitio Web') || answers.scope?.includes('Profesional') || answers.scope?.includes('blog') || answers.scope?.includes('varias')) s += 250;
      if (answers.goal?.includes('vender') || answers.goal?.includes('productos') || answers.goal?.includes('presencia')) s += 100;
      if (answers.mainProblem?.includes('organizar') || answers.mainProblem?.includes('vender más')) s += 80;
      if (answers.businessType?.includes('ropa') || answers.businessType?.includes('boutique') || answers.businessType?.includes('restaurante') || answers.businessType?.includes('servicios')) s += 90;
      if (text.includes('sitio web') || text.includes('profesional') || text.includes('blog') || text.includes('625') || text.includes('2.500.000')) s += 40;
      return s;
    },
  },
  {
    solutionId: 'enterprise',
    priceUSD: 1000,
    score: (answers) => {
      const text = extractTokens(answers);
      let s = 0;
      if (answers.scope?.includes('Personalizada') || answers.scope?.includes('medida') || answers.scope?.includes('IA') || answers.scope?.includes('plataforma')) s += 250;
      if (answers.goal?.includes('Sistema') || answers.goal?.includes('software') || answers.goal?.includes('automatizar')) s += 100;
      if (answers.mainProblem?.includes('sistema') || answers.mainProblem?.includes('manuales')) s += 90;
      if (answers.businessType?.includes('empresa mediana') || answers.businessType?.includes('empresa grande')) s += 90;
      if (text.includes('personalizada') || text.includes('automatización') || text.includes('ia') || text.includes('1.000') || text.includes('4.000.000')) s += 50;
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

  const freePlan = SAMTS_CATALOG.find((p) => (p.id as string) === STARTER_KIT_ID)!;
  if ((text.includes('gratis') || text.includes('sin dinero')) && freePlan) {
    const alternatives = SAMTS_CATALOG.filter((p) => p.id === 'landing' || p.id === 'catalog');
    return { primary: freePlan, alternatives };
  }

  const scored = RULES.map((rule) => {
    let score = rule.score(answers);
    const plan = SAMTS_CATALOG.find((p) => p.id === rule.solutionId)!;

    if (ceiling !== Infinity) {
      if (rule.priceUSD <= ceiling && rule.priceUSD >= ceiling - 200) {
        score += 120;
      } else if (rule.priceUSD <= ceiling) {
        score += 40;
      } else {
        score -= 200;
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

export function buildReasoning(
  answers: { businessType?: string; mainProblem?: string; goal?: string; scope?: string },
  primary: SolutionPlan
): string {
  const biz = answers.businessType ? `tu negocio (${answers.businessType})` : 'tu negocio';

  if (primary.id === 'catalog') {
    return `Para ${biz}, el Sitio Web Profesional ($2.500.000 COP / $625 USD) es ideal para posicionar tu marca con diseño personalizado, blog y formularios avanzados.`;
  }
  if (primary.id === 'landing') {
    return `Para ${biz}, la Landing Page ($900.000 COP / $225 USD) te dará presencia digital moderna de alto impacto para captar clientes desde el primer día.`;
  }
  if (primary.id === 'enterprise') {
    return `Para ${biz}, las Soluciones Personalizadas (Desde $4.000.000 COP / $1.000 USD) se adaptarán exactamente a los requerimientos, plataformas y automatizaciones con IA de tu empresa.`;
  }
  return `Propuesta diseñada para que ${biz} logre el máximo retorno con tecnología moderna y autogestionable.`;
}

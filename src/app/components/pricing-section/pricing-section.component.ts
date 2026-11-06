import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface PricingPlan {
  name: string;
  priceCOP: string;
  priceUSD: string;
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  highlight: boolean;
}

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
})
export class PricingSectionComponent {
  consultation = inject(ConsultationService);

  plans: PricingPlan[] = [
    {
      name: 'Landing Page',
      priceCOP: '$700.000 COP',
      priceUSD: '≈ $175 USD',
      period: 'pago único - entrega en 7 a 10 días',
      description: 'Presencia digital moderna y optimizada para captar clientes potenciales desde el primer día.',
      features: [
        'Diseño premium responsive',
        'Optimización para conversión móvil',
        'Formulario de contacto funcional',
        'Botón directo a WhatsApp',
        'SEO técnico inicial',
        'Configuración de hosting y despliegue',
      ],
      notIncluded: [
        'Múltiples secciones o páginas',
        'Pasarela de cobros en línea',
        'Panel administrativo de productos',
      ],
      highlight: false,
    },
    {
      name: 'Sitio Web Profesional',
      priceCOP: '$2.500.000 COP',
      priceUSD: '≈ $625 USD',
      period: 'pago único - entrega en 10 a 14 días',
      description: 'Plataforma completa para posicionar tu marca con múltiples páginas, blog y panel de administración.',
      features: [
        'Múltiples páginas estructuradas',
        'Blog o sección de novedades',
        'Diseño exclusivo a medida',
        'SEO avanzado y metaetiquetas',
        'Formularios avanzados y captura de leads',
        'Panel administrativo autogestionable (si aplica)',
      ],
      notIncluded: [
        'Pasarela de pagos transaccional compleja',
        'Sistemas ERP/CRM integrados a gran escala',
      ],
      highlight: true,
    },
    {
      name: 'Soluciones Personalizadas',
      priceCOP: '$4.000.000 COP',
      priceUSD: '≈ $1.000 USD',
      period: 'pago único - según requerimientos',
      description: 'El valor final depende de los requerimientos específicos del proyecto.',
      features: [
        'Plataformas SaaS a medida',
        'Sistemas web de gestión operativa',
        'E-commerce con pasarelas de pago',
        'Automatizaciones de flujos de trabajo',
        'Integración de Agentes de Inteligencia Artificial',
      ],
      notIncluded: [
        'Alcances no especificados en el acta de propuesta',
      ],
      highlight: false,
    },
  ];

  selectPlan(plan: PricingPlan): void {
    this.consultation.open({
      solutionInterest: plan.name,
      source: 'home_pricing',
      notes: `El visitante consultó el plan "${plan.name}" (${plan.priceCOP}).`,
    });
  }
}

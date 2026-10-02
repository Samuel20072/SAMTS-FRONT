import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ConsultationModalComponent],
  templateUrl: './pricing.page.html',
  styles: [`
    .pricing-card-highlighted {
      background-color: rgba(248, 250, 252, 0.65) !important;
      border-color: rgba(37, 99, 235, 0.8) !important;
      box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.15) !important;
      padding-top: 3.5rem !important;
      padding-bottom: 2.5rem !important;
      padding-left: 2rem !important;
      padding-right: 2rem !important;
    }
    :host-context(.dark) .pricing-card-highlighted {
      background-color: rgba(10, 13, 26, 0.6) !important;
      border-color: rgba(37, 99, 235, 0.9) !important;
      box-shadow: 0 0 60px rgba(37, 99, 235, 0.2) !important;
    }
    .pricing-card-standard {
      background-color: rgba(241, 245, 249, 0.6) !important;
      border-color: #cbd5e1 !important;
      padding-top: 3rem !important;
      padding-bottom: 2.5rem !important;
      padding-left: 2rem !important;
      padding-right: 2rem !important;
    }
    :host-context(.dark) .pricing-card-standard {
      background-color: rgba(8, 8, 12, 0.6) !important;
      border-color: #0f172a !important;
    }
    .pricing-btn-highlighted {
      background-color: #2563eb !important;
      color: #ffffff !important;
      box-shadow: 0 0 25px rgba(37, 99, 235, 0.4) !important;
    }
    .pricing-btn-highlighted:hover {
      background-color: #3b82f6 !important;
    }
    .pricing-btn-standard {
      background-color: #f1f5f9 !important;
      color: #334155 !important;
      border: 1px solid #cbd5e1 !important;
    }
    .pricing-btn-standard:hover {
      background-color: #e2e8f0 !important;
      border-color: #cbd5e1 !important;
    }
    :host-context(.dark) .pricing-btn-standard {
      background-color: #0d0f14 !important;
      color: #cbd5e1 !important;
      border: 1px solid #0f172a !important;
    }
    :host-context(.dark) .pricing-btn-standard:hover {
      background-color: #141822 !important;
      border-color: #1e293b !important;
    }
  `]
})
export class PricingPage {
  modalService = inject(ConsultationService);
  
  openConsultation() {
    this.modalService.open();
  }

  plans = [
    {
      name: 'Landing Page',
      priceCOP: '$900.000 COP',
      priceUSD: '$225 USD',
      period: 'pago único - entrega en 7 a 10 días',
      description: 'Presencia digital moderna y optimizada para captar clientes potenciales desde el primer día.',
      features: [
        'Diseño premium',
        'Responsive',
        'Formulario de contacto',
        'Botón de WhatsApp',
        'SEO básico',
        'Hosting'
      ],
      highlight: false
    },
    {
      name: 'Sitio Web Profesional',
      priceCOP: '$2.500.000 COP',
      priceUSD: '$625 USD',
      period: 'pago único - entrega en 10 a 14 días',
      description: 'Plataforma completa para posicionar tu marca con múltiples páginas, blog y panel de administración.',
      features: [
        'Varias páginas',
        'Blog',
        'Diseño personalizado',
        'SEO básico',
        'Formularios avanzados',
        'Panel administrativo (si aplica)'
      ],
      highlight: true
    },
    {
      name: 'Soluciones Personalizadas',
      priceCOP: '$4.000.000 COP',
      priceUSD: '$1.000 USD',
      period: 'pago único - según requerimientos',
      description: 'El valor final depende de los requerimientos específicos del proyecto.',
      features: [
        'Plataformas',
        'Sistemas administrativos',
        'E-commerce avanzado',
        'Automatizaciones',
        'Integraciones'
      ],
      highlight: false
    }
  ];
}

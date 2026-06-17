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
      background-color: rgba(10, 13, 26, 0.6) !important;
      border-color: rgba(37, 99, 235, 0.9) !important;
      box-shadow: 0 0 60px rgba(37, 99, 235, 0.2) !important;
      padding-top: 3.5rem !important;
      padding-bottom: 2.5rem !important;
      padding-left: 2rem !important;
      padding-right: 2rem !important;
    }
    .pricing-card-standard {
      background-color: rgba(8, 8, 12, 0.6) !important;
      border-color: #0f172a !important;
      padding-top: 3rem !important;
      padding-bottom: 2.5rem !important;
      padding-left: 2rem !important;
      padding-right: 2rem !important;
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
      background-color: #0d0f14 !important;
      color: #cbd5e1 !important;
      border: 1px solid #0f172a !important;
    }
    .pricing-btn-standard:hover {
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
      name: 'Startup',
      price: '$990',
      period: 'pago único - entrega en 2 semanas',
      description: 'Para negocios que necesitan presencia web profesional y empezar a crecer.',
      features: [
        'Diseño web premium (5 vistas)',
        'Optimización móvil y SEO básico',
        'Formularios de contacto avanzados',
        'Soporte técnico 1 mes',
        'Hosting gratis x 1 año'
      ],
      highlight: false
    },
    {
      name: 'Neural AI Pro',
      price: '$2,490',
      period: 'pago único - entrega en 3 semanas',
      description: 'Automatización total. Tu página vende, califica y crece sola con IA integrada.',
      features: [
        'Todo lo del plan Startup',
        'Chatbot IA entrenado con tus datos',
        'E-commerce + pasarelas de pago',
        'Generación automática de leads',
        'Dashboard administrativo',
        'Soporte VIP 3 meses'
      ],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'A medida',
      period: 'suscripción o proyecto, conversemos',
      description: 'Para empresas que necesitan sistemas a medida, integraciones y escalabilidad total.',
      features: [
        'Arquitectura en la nube escalable',
        'Agentes multicanal (WhatsApp, Web)',
        'Integración con ERPs y CRMs',
        'Modelos RAG propios',
        'Acuerdo SLA 99.9% uptime'
      ],
      highlight: false
    }
  ];
}

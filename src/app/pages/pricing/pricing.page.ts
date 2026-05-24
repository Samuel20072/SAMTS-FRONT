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
  templateUrl: './pricing.page.html'
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
      period: 'pago único',
      description: 'Ideal para negocios emergentes que necesitan presencia online profesional.',
      features: [
        'Diseño Web Premium (5 vistas)',
        'Optimización Móvil y SEO Básico',
        'Formularios de Contacto Avanzados',
        'Soporte Técnico 1 mes',
        'Hosting Gratis x 1 Año'
      ],
      highlight: false
    },
    {
      name: 'Neural AI Pro',
      price: '$2,490',
      period: 'pago único',
      description: 'Automatización total. Vende en piloto automático con agentes de IA integrados.',
      features: [
        'Todo lo del plan Startup',
        'Chatbot IA entrenado con tus datos',
        'E-commerce integrado (Pasarelas de Pago)',
        'Generación Automática de Leads',
        'Dashboard Administrativo',
        'Soporte Técnico VIP 3 meses'
      ],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'A Medida',
      period: 'suscripción/proyecto',
      description: 'Sistemas a gran escala, redes neuronales y automatización corporativa profunda.',
      features: [
        'Arquitectura en la Nube Escalable',
        'Agentes Multicanal (WhatsApp, Web, RRSS)',
        'Integración con ERPs y CRMs externos',
        'Desarrollo de Modelos RAG Propios',
        'Acuerdo SLA 99.9% Uptime'
      ],
      highlight: false
    }
  ];
}

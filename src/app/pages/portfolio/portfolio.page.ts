import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ConsultationModalComponent],
  templateUrl: './portfolio.page.html'
})
export class PortfolioPage {
  modalService = inject(ConsultationService);
  projects = [
    {
      title: 'E-commerce Deportivo Automatizado',
      client: 'FitGear Pro',
      description: 'Tienda online con gestión de inventario automatizada por IA, descripciones generadas semánticamente y chatbot de ventas integrado. Sin intervención manual en el día a día.',
      metrics: [
        { label: 'CONVERSIÓN', value: '+45%' },
        { label: 'VENTAS VÍA BOT', value: '32%' },
        { label: 'VISITAS/MES', value: '120K' }
      ],
      tags: ['Angular', 'NestJS', 'GPT-4', 'Stripe'],
      isPlaceholder: false
    },
    {
      title: 'Plataforma Educativa con Tutores IA',
      client: 'EduTech Latam',
      description: 'Campus virtual con tutores cognitivos de IA entrenados con la currícula oficial. Respuestas en milisegundos y seguimiento automatizado del progreso de cada estudiante.',
      metrics: [
        { label: 'RETENCIÓN', value: '94%' },
        { label: 'SOPORTE IA', value: '24/7' },
        { label: 'USUARIOS ACTIVOS', value: '15K' }
      ],
      tags: ['Next.js', 'NestJS', 'RAG AI', 'WebSockets'],
      isPlaceholder: false
    },
    {
      title: 'Landing Page Generadora de Leads',
      client: 'Inmobiliaria Skyline',
      description: 'Landing page premium con recorridos virtuales en 3D y agente de WhatsApp que califica, responde objeciones y agenda citas para el equipo comercial.',
      metrics: [
        { label: 'LEADS CALIFICADOS', value: '+300%' },
        { label: 'COSTO POR LEAD', value: '-60%' },
        { label: 'TASA DE CIERRE', value: '18%' }
      ],
      tags: ['Tailwind', 'Three.js', 'WhatsApp API', 'Claude 3'],
      isPlaceholder: false
    },
    {
      title: 'Tu proyecto podría estar aquí.',
      client: 'PRÓXIMAMENTE',
      description: 'Cada proyecto que completamos se convierte en un caso de estudio real con métricas verificables. Sin fotos de stock. Sin números inventados.',
      metrics: [],
      tags: ['Angular', 'NextJS', 'SAMTS - AI'],
      isPlaceholder: true
    }
  ];
}

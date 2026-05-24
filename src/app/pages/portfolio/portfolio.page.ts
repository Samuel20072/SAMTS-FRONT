import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ConsultationModalComponent],
  templateUrl: './portfolio.page.html'
})
export class PortfolioPage {
  projects = [
    {
      title: 'E-commerce Deportivo Automatizado',
      client: 'FitGear Pro',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
      description: 'Una tienda online completa con gestión de inventario automatizada por IA, descripciones generadas semánticamente y chatbot de ventas integrado.',
      metrics: [
        { label: 'Conversión', value: '+45%' },
        { label: 'Ventas Bot', value: '32%' },
        { label: 'Visitas', value: '120K/mes' }
      ],
      tags: ['Angular', 'Node.js', 'GPT-4 Vision', 'Stripe']
    },
    {
      title: 'Plataforma Educativa con Tutores IA',
      client: 'EduTech Latam',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800',
      description: 'Desarrollo de un campus virtual donde cada estudiante tiene un tutor privado de IA entrenado con la currícula específica de sus cursos.',
      metrics: [
        { label: 'Retención', value: '94%' },
        { label: 'Soporte', value: '24/7' },
        { label: 'Usuarios', value: '15K Activos' }
      ],
      tags: ['Next.js', 'NestJS', 'RAG AI', 'WebSockets']
    },
    {
      title: 'Landing Page Generadora de Leads',
      client: 'Inmobiliaria Skyline',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      description: 'Landing page premium con recorridos virtuales en 3D. Un agente conversacional en WhatsApp califica los leads automáticamente antes de pasarlos a un asesor.',
      metrics: [
        { label: 'Leads Calificados', value: '+300%' },
        { label: 'Costo x Lead', value: '-60%' },
        { label: 'Cierre', value: '18%' }
      ],
      tags: ['Tailwind', 'Three.js', 'WhatsApp API', 'Claude 3']
    }
  ];
}

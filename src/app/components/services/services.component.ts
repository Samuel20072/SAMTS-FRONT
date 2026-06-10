import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';

interface ServiceItem {
  title: string;
  description: string;
  badge?: string;
  tags: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  modalService = inject(ConsultationService);
  scrollY = signal(0);

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }

  services: ServiceItem[] = [
    {
      title: 'IA Automática',
      badge: 'MÁS SOLICITADO',
      description: 'Tu página genera contenido, publica promociones y optimiza tu SEO de forma automática. Sin que muevas un dedo.',
      tags: ['Blog 100% Auto', 'Promociones', 'SEO', 'Redes sociales']
    },
    {
      title: 'Páginas Web Premium',
      description: 'Sitios rápidos, modernos y optimizados para convertir visitantes en clientes, desde el primer segundo.',
      tags: ['Exclusivo', 'High-performance', 'Responsivo']
    },
    {
      title: 'Tiendas Online',
      description: 'Vende tus productos con pasarelas de pago integradas, gestión de inventario y envíos automatizados.',
      tags: ['E-commerce', 'Pagos', 'Inventario']
    },
    {
      title: 'Landing Pages',
      description: 'Páginas enfocadas en una sola acción: captar leads, vender o registrar. Máxima conversión por diseño.',
      tags: ['Conversión', 'Leads', 'Marketing']
    }
  ];

  openConsultation() {
    this.modalService.open();
  }
}

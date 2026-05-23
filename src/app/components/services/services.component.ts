import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  colorClass: string;
  iconBg: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  modalService = inject(ConsultationService);

  services: ServiceItem[] = [
    {
      icon: 'pi pi-desktop',
      title: 'Páginas Web Premium',
      description: 'Diseños modernos, rápidos y optimizados para convertir visitantes en clientes de forma efectiva.',
      colorClass: 'text-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: 'pi pi-sitemap', // representing node network / IA
      title: 'IA Automática',
      description: 'Contenido, promociones y publicaciones generadas por IA todos los días sin que muevas un dedo.',
      colorClass: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: 'pi pi-shopping-cart',
      title: 'Tiendas Online',
      description: 'Vende tus productos con pasarelas de pago integradas, gestión de inventario y envíos automatizados.',
      colorClass: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      icon: 'pi pi-rocket',
      title: 'Landing Pages',
      description: 'Páginas enfocadas en campañas de marketing, captación de leads y máxima generación de resultados.',
      colorClass: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  openConsultation() {
    this.modalService.open();
  }
}

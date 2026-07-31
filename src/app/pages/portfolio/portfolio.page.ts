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
      title: 'E-commerce Premium & Panel Administrativo',
      client: 'Luxury Store',
      description: 'Plataforma de comercio electrónico de alta gama diseñada para calzado y moda exclusiva. Integra pasarela de pagos, catálogo dinámico interactivo y un panel de administración completo que permite gestionar de manera autónoma el stock, productos, pedidos e inventario en tiempo real.',
      metrics: [
        { label: 'ADMINISTRACIÓN', value: '100% Autónoma' },
        { label: 'PROCESO DE PAGO', value: '< 1 Minuto' },
        { label: 'DISEÑO UI/UX', value: 'Premium' }
      ],
      tags: ['Angular', 'Node.js', 'PostgreSQL', 'Express', 'Admin Panel', 'E-commerce'],
      isPlaceholder: false,
      videoUrl: '/videos/luxury-store.mp4',
      siteUrl: 'https://luxury-store.co',
      videoError: false
    },
    {
      title: 'Portal Gastronómico & Sistema de Reservas',
      client: 'Santuario Café & Restaurante',
      description: 'Sitio web oficial y panel administrativo para uno de los destinos gastronómicos más emblemáticos de Circasia, Quindío. Permite la visualización y edición en tiempo real del menú digital interactivo, la promoción de eventos y celebraciones, y la gestión digital del flujo de clientes.',
      metrics: [
        { label: 'MENÚ DIGITAL', value: 'En Vivo' },
        { label: 'ADMINISTRACIÓN', value: 'Panel Web' },
        { label: 'UBICACIÓN', value: 'Circasia, Q.' }
      ],
      tags: ['Angular', 'Node.js', 'Admin Panel', 'Tailwind CSS', 'Gestión de Menú'],
      isPlaceholder: false,
      videoUrl: '/videos/santuario-circasia.mp4',
      siteUrl: 'https://santuario-circasia.com',
      videoError: false
    },
    {
      title: 'Tu proyecto podría estar aquí.',
      client: 'PRÓXIMAMENTE',
      description: 'Trabajamos contigo para diseñar y desarrollar soluciones web a medida con paneles administrativos autogestionables, integraciones API y alto rendimiento.',
      metrics: [],
      tags: ['Angular', 'NestJS', 'SAMTS - AI'],
      isPlaceholder: true
    }
  ];
}

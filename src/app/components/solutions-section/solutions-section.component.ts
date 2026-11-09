import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface Solution {
  id: string;
  name: string;
  icon: string;
  description: string;
  problem: string;
  tags: string[];
  /** 'feature' = tarjeta destacada con mockup · 'wide' = ocupa 2 columnas · 'normal' = 1 columna */
  span: 'feature' | 'wide' | 'normal';
  badge?: string;
}

@Component({
  selector: 'app-solutions-section',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './solutions-section.component.html',
  styleUrls: ['./solutions-section.component.scss'],
})
export class SolutionsSectionComponent {
  consult = inject(ConsultationService);

  solutions: Solution[] = [
    {
      id: 'web',
      name: 'Páginas Web Profesionales',
      icon: 'pi-desktop',
      description:
        'Sitios rápidos, modernos y optimizados para convertir visitantes en clientes desde el primer segundo.',
      problem: 'No tener una presencia digital que transmita confianza y capture clientes.',
      tags: ['Diseño responsive', 'Optimización SEO', 'Carga rápida', 'Enfoque en conversión'],
      span: 'feature',
    },
    {
      id: 'tiendas',
      name: 'Tiendas Virtuales',
      icon: 'pi-shopping-cart',
      description:
        'Vende tus productos con pasarelas de pago integradas, gestión de inventario y control de pedidos.',
      problem: 'Vender por internet de forma ordenada, con cobros en línea y control de inventario.',
      tags: ['Pasarelas de pago', 'Gestión de inventario', 'Control de pedidos'],
      span: 'normal',
    },
    {
      id: 'catalogos',
      name: 'Catálogos Digitales',
      icon: 'pi-images',
      description:
        'Exhibe tus productos o servicios con fotos, descripciones y precios actualizables desde un panel administrativo.',
      problem: 'Mostrar el catálogo de forma clara y siempre actualizado, sin depender de un técnico.',
      tags: ['Galería de productos', 'Precios actualizables', 'Panel de gestión'],
      span: 'normal',
    },
    {
      id: 'sistemas',
      name: 'Sistemas Administrativos',
      icon: 'pi-sliders-h',
      description:
        'Plataformas web para centralizar clientes, pedidos, inventario y reportes de tu operación.',
      problem: 'Gestionar la operación en hojas de cálculo dispersas y sin control.',
      tags: ['Clientes', 'Inventario', 'Reportes', 'Usuarios y roles'],
      span: 'normal',
    },
    {
      id: 'medida',
      name: 'Aplicaciones y Sistemas a Medida',
      icon: 'pi-server',
      description: 'Desarrollos full-stack a la medida de procesos y reglas de negocio específicas.',
      problem: 'Procesos únicos que ninguna herramienta genérica resuelve bien.',
      tags: ['Full-stack', 'Integraciones API', 'Escalable'],
      span: 'normal',
    },
    {
      id: 'automatizaciones',
      name: 'Automatizaciones',
      icon: 'pi-bolt',
      description:
        'Integramos tus herramientas y automatizamos tareas repetitivas para reducir horas operativas.',
      problem: 'Tareas repetitivas que consumen tiempo del equipo cada día.',
      tags: ['Integraciones', 'Flujos automáticos', 'Ahorro de tiempo operativo'],
      span: 'wide',
    },
    {
      id: 'ia',
      name: 'Soluciones con Inteligencia Artificial',
      icon: 'pi-sparkles',
      description:
        'Agentes y flujos de IA para atención, contenido y análisis dentro de tu negocio.',
      problem: 'Responder y operar con la velocidad que el negocio necesita, sin sumar personal.',
      tags: ['Agentes de atención', 'Generación de contenido', 'Análisis'],
      span: 'normal',
      badge: 'IA',
    },
  ];

  openConsultation(solution: Solution): void {
    this.consult.open({
      solutionInterest: solution.name,
      mainProblem: solution.problem,
      source: 'home_solutions',
    });
  }
}

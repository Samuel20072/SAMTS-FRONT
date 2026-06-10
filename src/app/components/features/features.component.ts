import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StepItem {
  number: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html'
})
export class FeaturesComponent {
  steps: StepItem[] = [
    {
      number: 1,
      title: 'Analiza tu negocio',
      description: 'La IA entiende tu industria, productos y objetivos comerciales para trazar la estrategia correcta.'
    },
    {
      number: 2,
      title: 'Genera contenido',
      description: 'Artículos, promociones, banners y textos SEO creados y publicados automáticamente en tu sitio.'
    },
    {
      number: 3,
      title: 'Atrae y convierte',
      description: 'Tu página trabaja 24/7 posicionándote en Google y captando clientes sin intervención manual.'
    },
    {
      number: 4,
      title: 'Te mantiene informado',
      description: 'Reportes de rendimiento y notificaciones inteligentes de lo que hace la IA por tu negocio.'
    }
  ];
}

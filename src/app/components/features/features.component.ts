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
      description: 'La IA entiende tu industria, tus productos y tus objetivos comerciales para trazar la mejor estrategia.'
    },
    {
      number: 2,
      title: 'Crea y optimiza',
      description: 'Genera contenido relevante, diseña promociones y actualiza tu sitio constantemente basado en tendencias.'
    },
    {
      number: 3,
      title: 'Atrae y convierte',
      description: 'Tu página trabaja 24/7 para atraer clientes cualificados y cerrar ventas de manera orgánica.'
    },
    {
      number: 4,
      title: 'Te mantiene informado',
      description: 'Recibe reportes de ventas y notificaciones inteligentes directamente en WhatsApp sin entrar a la web.'
    }
  ];
}

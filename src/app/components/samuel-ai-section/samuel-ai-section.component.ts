import { Component, inject } from '@angular/core';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';

@Component({
  selector: 'app-samuel-ai-section',
  standalone: true,
  imports: [AnimateOnScrollDirective],
  templateUrl: './samuel-ai-section.component.html',
  styleUrls: ['./samuel-ai-section.component.scss'],
})
export class SamuelAiSectionComponent {
  readonly samuel = inject(SamuelDiagnosisService);

  readonly benefits: string[] = [
    'Diagnóstico guiado paso a paso',
    'Recomendación de la solución adecuada para tu caso',
    'Sin costo y en pocos minutos',
    'Entiende tu contexto y tus objetivos de negocio',
    'Te conecta directamente con el siguiente paso',
  ];

  /** Abre la experiencia real de diagnóstico de Samuel AI. */
  startDiagnosis(): void {
    this.samuel.startHome();
  }
}

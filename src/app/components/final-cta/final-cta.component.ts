import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-final-cta',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './final-cta.component.html',
  styleUrls: ['./final-cta.component.scss'],
})
export class FinalCtaComponent {
  consultation = inject(ConsultationService);

  readonly whatsappUrl = 'https://wa.me/573148180949';

  startProject(): void {
    this.consultation.open({
      source: 'home_final_cta',
      notes: 'CTA final de la Home.',
    });
  }
}

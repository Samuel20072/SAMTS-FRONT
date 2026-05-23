import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './cta.component.html'
})
export class CtaComponent {
  modalService = inject(ConsultationService);

  openConsultation() {
    this.modalService.open();
  }
}

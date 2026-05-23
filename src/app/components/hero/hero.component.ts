import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  modalService = inject(ConsultationService);
  showDemoVideo = signal(false);

  openConsultation() {
    this.modalService.open();
  }

  playDemo() {
    this.showDemoVideo.set(true);
  }

  closeDemo() {
    this.showDemoVideo.set(false);
  }
}

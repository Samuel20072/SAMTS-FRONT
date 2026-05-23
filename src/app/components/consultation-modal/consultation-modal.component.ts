import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-consultation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Dialog, InputText, Textarea],
  templateUrl: './consultation-modal.component.html'
})
export class ConsultationModalComponent {
  modalService = inject(ConsultationService);

  // Form Fields
  name = signal('');
  email = signal('');
  whatsapp = signal('');
  details = signal('');

  // Form State
  isSubmitting = signal(false);
  isSuccess = signal(false);

  onSubmit() {
    if (!this.name() || !this.email() || !this.whatsapp()) {
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      
      // Reset form after delay
      setTimeout(() => {
        this.closeModal();
      }, 3000);
    }, 1500);
  }

  closeModal() {
    this.modalService.close();
    // Delay resetting form state so user doesn't see it change as it closes
    setTimeout(() => {
      this.name.set('');
      this.email.set('');
      this.whatsapp.set('');
      this.details.set('');
      this.isSuccess.set(false);
    }, 300);
  }
}

import { Component, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { ConsultationService } from '../../services/consultation.service';
import { LeadMagnetApiService } from '../../services/api/lead-magnet-api.service';
import { AnalyticsService } from '../../services/analytics.service';
import { UtmService } from '../../services/utm.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-consultation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Dialog, InputText, Textarea],
  templateUrl: './consultation-modal.component.html'
})
export class ConsultationModalComponent {
  private platformId = inject(PLATFORM_ID);
  modalService = inject(ConsultationService);
  private leadApi = inject(LeadMagnetApiService);
  private analytics = inject(AnalyticsService);
  private utmService = inject(UtmService);

  // Form Fields — plain properties for [(ngModel)] two-way binding compatibility
  name = '';
  email = '';
  whatsapp = '';
  businessName = '';
  solutionInterest = '';
  details = '';
  acceptDataPolicy = true;

  // Reactive UI State — signals for conditional rendering
  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  readonly whatsappPhone = environment.whatsappNumber || '3148180949';

  constructor() {
    effect(() => {
      const ctx = this.modalService.context();
      if (ctx) {
        if (ctx.solutionInterest) this.solutionInterest = ctx.solutionInterest;
        if (ctx.businessName) this.businessName = ctx.businessName;
        if (ctx.notes) this.details = ctx.notes;
      }
    });
  }

  onSubmit() {
    if (!this.name.trim() || !this.email.trim() || !this.whatsapp.trim()) {
      this.errorMessage.set('Por favor completa tu nombre, correo y WhatsApp.');
      return;
    }

    if (!this.acceptDataPolicy) {
      this.errorMessage.set('Debes autorizar el tratamiento de datos para continuar.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const ctx = this.modalService.context();
    const utm = this.utmService.getUtmParams();

    const payload = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      whatsapp: this.whatsapp.trim(),
      businessName: this.businessName.trim() || undefined,
      businessType: ctx?.businessType || 'General',
      mainProblem: ctx?.mainProblem || undefined,
      solutionInterest: this.solutionInterest || ctx?.solutionInterest || 'Propuesta Comercial',
      budget: ctx?.budget || undefined,
      urgency: ctx?.urgency || undefined,
      details: this.details.trim() || undefined,
      diagnosticSessionId: ctx?.diagnosticSessionId || undefined,
      campaign: 'consultation_modal',
      source: ctx?.source || 'web_modal',
      landingPage: isPlatformBrowser(this.platformId) ? window.location.pathname : undefined,
      utmSource: utm['utm_source'],
      utmMedium: utm['utm_medium'],
      utmCampaign: utm['utm_campaign'],
      utmContent: utm['utm_content'],
      utmTerm: utm['utm_term'],
    };

    this.leadApi.createLead(payload).subscribe({
      next: (_res) => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.analytics.track('lead_created', {
          solution: payload.solutionInterest,
          source: payload.source,
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error saving lead:', err);
        const serverMsg = err?.error?.message;
        if (Array.isArray(serverMsg)) {
          this.errorMessage.set(serverMsg.join(', '));
        } else if (typeof serverMsg === 'string') {
          this.errorMessage.set(serverMsg);
        } else {
          this.errorMessage.set('Hubo un problema al enviar tu solicitud. Puedes reintentar o escribirnos directamente a WhatsApp.');
        }
      }
    });
  }

  openDirectWhatsApp() {
    this.analytics.track('whatsapp_clicked', { source: 'consultation_success' });
    const sol = this.solutionInterest || 'una solución web / IA';
    const text = encodeURIComponent(
      `¡Hola SAMTS! Acabo de enviar una solicitud para ${sol}. Mi nombre es ${this.name.trim()} y me gustaría recibir más detalles.`
    );
    if (isPlatformBrowser(this.platformId)) {
      window.open(`https://wa.me/57${this.whatsappPhone}?text=${text}`, '_blank');
    }
  }

  closeModal() {
    this.modalService.close();
    setTimeout(() => {
      this.name = '';
      this.email = '';
      this.whatsapp = '';
      this.businessName = '';
      this.solutionInterest = '';
      this.details = '';
      this.isSuccess.set(false);
      this.errorMessage.set(null);
      this.modalService.clearContext();
    }, 300);
  }
}

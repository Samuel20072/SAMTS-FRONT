import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { FooterComponent } from '../../components/footer/footer.component';
import { LeadMagnetApiService } from '../../services/api/lead-magnet-api.service';
import { AnalyticsService } from '../../services/analytics.service';
import { UtmService } from '../../services/utm.service';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, AnimateOnScrollDirective],
  templateUrl: './contact.page.html',
})
export class ContactPage {
  private leadApi = inject(LeadMagnetApiService);
  private analytics = inject(AnalyticsService);
  private utmService = inject(UtmService);
  samuel = inject(SamuelDiagnosisService);

  readonly whatsappPhone = environment.whatsappNumber || '3148180949';

  // Form Model
  name = '';
  email = '';
  whatsapp = '';
  businessName = '';
  solutionInterest = 'Página Web Profesional';
  details = '';
  acceptDataPolicy = true;

  // UI State
  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  readonly solutionOptions = [
    'Página Web Profesional',
    'Landing Page de Conversión',
    'Catálogo Digital Administrable',
    'Tienda Virtual (E-commerce)',
    'Sistema Web de Gestión Personalizado',
    'Automatizaciones & Agentes de IA',
    'Diagnóstico Tecnológico General'
  ];

  onSubmit(): void {
    if (!this.name.trim() || !this.email.trim() || !this.whatsapp.trim()) {
      this.errorMessage.set('Por favor completa los campos obligatorios: Nombre, Correo y WhatsApp.');
      return;
    }

    if (!this.acceptDataPolicy) {
      this.errorMessage.set('Debes autorizar el tratamiento de datos para enviar tu solicitud.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const utm = this.utmService.getUtmParams();

    const payload = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      whatsapp: this.whatsapp.trim(),
      businessName: this.businessName.trim() || undefined,
      solutionInterest: this.solutionInterest,
      details: this.details.trim() || undefined,
      campaign: 'contact_page',
      source: 'contact_page_form',
      landingPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      utmSource: utm['utm_source'],
      utmMedium: utm['utm_medium'],
      utmCampaign: utm['utm_campaign'],
      utmContent: utm['utm_content'],
      utmTerm: utm['utm_term'],
    };

    this.leadApi.createLead(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.analytics.track('consultation_submitted', {
          solution: payload.solutionInterest,
          source: payload.source
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error enviando contacto:', err);
        const serverMsg = err?.error?.message;
        if (Array.isArray(serverMsg)) {
          this.errorMessage.set(serverMsg.join(', '));
        } else if (typeof serverMsg === 'string') {
          this.errorMessage.set(serverMsg);
        } else {
          this.errorMessage.set('No pudimos procesar tu solicitud en este momento. Por favor escríbenos directamente a WhatsApp.');
        }
      }
    });
  }

  openWhatsApp(): void {
    const text = encodeURIComponent(
      `¡Hola SAMTS! Me gustaría solicitar información sobre ${this.solutionInterest}. Mi nombre es ${this.name.trim() || 'un visitante web'}.`
    );
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/57${this.whatsappPhone}?text=${text}`, '_blank');
    }
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.whatsapp = '';
    this.businessName = '';
    this.details = '';
    this.isSuccess.set(false);
    this.errorMessage.set(null);
  }
}

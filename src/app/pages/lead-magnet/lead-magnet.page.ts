import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LeadMagnetApiService } from '../../services/api/lead-magnet-api.service';
import { AnalyticsService } from '../../services/analytics.service';
import { UtmService } from '../../services/utm.service';
import { environment } from '../../../environments/environment';

type FormStep = 'landing' | 'form' | 'success';

@Component({
  selector: 'app-lead-magnet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './lead-magnet.page.html',
  styleUrl: './lead-magnet.page.scss',
})
export class LeadMagnetPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(LeadMagnetApiService);
  private analytics = inject(AnalyticsService);
  private utmService = inject(UtmService);

  // ── State ──────────────────────────────────────────────────────────────────
  step = signal<FormStep>('landing');
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  leadId = signal<string | null>(null);

  // ── Form fields ────────────────────────────────────────────────────────────
  name = signal('');
  email = signal('');
  whatsapp = signal('');
  businessType = signal('');
  hasWebsite = signal('');
  acceptTerms = signal(false);

  // ── Validation errors ──────────────────────────────────────────────────────
  nameError = signal('');
  emailError = signal('');
  businessTypeError = signal('');
  termsError = signal('');

  readonly businessTypes = [
    'Tienda online',
    'Restaurante',
    'Boutique / moda',
    'Belleza',
    'Barbería',
    'Gimnasio',
    'Servicios profesionales',
    'Inmobiliaria',
    'Otro',
  ];

  readonly websiteOptions = [
    'Sí',
    'No',
    'Tengo una pero quiero mejorarla',
  ];

  readonly pdfUrl = environment.leadMagnetPdfUrl;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Capture UTM params from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.utmService.captureFromUrl(urlParams);

    // Fire analytics: user viewed the lead magnet landing
    this.analytics.track('lead_magnet_view', {}, { deduplicate: true });
  }

  openForm(): void {
    this.step.set('form');
    this.analytics.track('lead_magnet_form_open', {}, { deduplicate: true });
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }

  validateForm(): boolean {
    let valid = true;

    this.nameError.set('');
    this.emailError.set('');
    this.businessTypeError.set('');
    this.termsError.set('');

    if (!this.name().trim() || this.name().trim().length < 2) {
      this.nameError.set('Ingresa tu nombre completo.');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email().trim() || !emailRegex.test(this.email().trim())) {
      this.emailError.set('Ingresa un correo electrónico válido.');
      valid = false;
    }

    if (!this.businessType()) {
      this.businessTypeError.set('Selecciona el tipo de negocio.');
      valid = false;
    }

    if (!this.acceptTerms()) {
      this.termsError.set('Debes aceptar para continuar.');
      valid = false;
    }

    return valid;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const utm = this.utmService.getParams();

    const payload = {
      name: this.name().trim(),
      email: this.email().trim().toLowerCase(),
      whatsapp: this.whatsapp().trim() || undefined,
      businessType: this.businessType(),
      hasWebsite: this.hasWebsite() || undefined,
      ...utm,
    };

    this.api.createLead(payload).subscribe({
      next: (lead) => {
        this.leadId.set(lead.id);
        this.isSubmitting.set(false);
        this.step.set('success');

        this.analytics.track('lead_magnet_form_submit', {
          business_type: payload.businessType,
          has_website: payload.hasWebsite ?? 'not_answered',
          utm_source: utm.utmSource ?? 'direct',
        });

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          'Ocurrió un error al enviar. Por favor inténtalo de nuevo.',
        );
        console.error('Lead magnet submit error:', err);
      },
    });
  }

  downloadPdf(): void {
    const id = this.leadId();

    this.analytics.track('pdf_download', {
      lead_id: id ?? 'unknown',
    });

    if (id) {
      this.api.markPdfDownloaded(id).subscribe({ error: () => {} });
    }

    if (isPlatformBrowser(this.platformId)) {
      const a = document.createElement('a');
      a.href = this.pdfUrl;
      a.download = 'De-Instagram-a-Ventas-SAMTS.pdf';
      a.click();
    }
  }

  onWebsiteChoice(choice: string): void {
    this.analytics.track('website_status_selected', { choice });

    if (choice === 'No') {
      // Navigate to main SAMTS diagnostic
      this.router.navigate(['/']);
    } else {
      // Has website or wants to improve → diagnostic flow
      this.onStartDiagnostic();
    }
  }

  onStartDiagnostic(): void {
    const id = this.leadId();
    this.analytics.track('diagnostic_started', { lead_id: id ?? 'unknown' });

    if (id) {
      this.api.markDiagnosticVisited(id).subscribe({ error: () => {} });
    }

    this.router.navigate(['/']);
  }
}

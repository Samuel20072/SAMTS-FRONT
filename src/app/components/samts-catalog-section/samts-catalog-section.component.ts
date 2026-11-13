import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';

import { ConsultationService } from '../../services/consultation.service';
import { LeadMagnetApiService, CampaignStats } from '../../services/api/lead-magnet-api.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { AnalyticsService } from '../../services/analytics.service';
import { UtmService } from '../../services/utm.service';

interface CatalogProduct {
  name: string;
  category: string;
  price: string;
  image: string;
}

interface CatalogBenefit {
  icon: string;
  title: string;
  text: string;
}

interface CatalogStep {
  n: string;
  title: string;
  text: string;
}

interface BusinessTypeOption {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-samts-catalog-section',
  standalone: true,
  imports: [CommonModule, Dialog, FormsModule, InputText, Checkbox, AnimateOnScrollDirective],
  templateUrl: './samts-catalog-section.component.html',
  styleUrls: ['./samts-catalog-section.component.scss'],
})
export class SamtsCatalogSectionComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private consult = inject(ConsultationService);
  private leadApi = inject(LeadMagnetApiService);
  private analytics = inject(AnalyticsService);
  private utmService = inject(UtmService);

  readonly campaignId = 'lanzamiento_20_dias';
  readonly launchDate = 'lunes 16 de noviembre de 2026';

  /** Modal informativo "¿Cómo funciona?" */
  readonly howItWorksOpen = signal(false);

  /** Modal de registro para la campaña */
  readonly registrationOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly registrationResult = signal<'selected' | 'waitlist' | null>(null);
  readonly errorMessage = signal<string | null>(null);

  /** Datos de la campaña desde el backend */
  readonly campaignStats = signal<CampaignStats | null>(null);

  /** Form Fields */
  name = '';
  email = '';
  whatsapp = '';
  businessName = '';
  acceptDataPolicy = false;
  selectedBusinessType = signal('');

  readonly businessTypes: BusinessTypeOption[] = [
    { label: 'Tienda de ropa', value: 'tienda de ropa', icon: 'pi-tag' },
    { label: 'Restaurante / Café', value: 'restaurante', icon: 'pi-shopping-bag' },
    { label: 'Belleza / Salud', value: 'belleza', icon: 'pi-heart' },
    { label: 'Tecnología', value: 'tecnología', icon: 'pi-desktop' },
    { label: 'Emprendimiento', value: 'emprendimiento', icon: 'pi-bolt' },
    { label: 'Otro', value: 'otro', icon: 'pi-sparkles' },
  ];

  readonly categories = ['Todo', 'Cerámica', 'Accesorios', 'Hogar', 'Textiles'];
  readonly selectedCategory = signal('Todo');

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  /** Productos de ejemplo de una tienda ficticia (maqueta conceptual). */
  readonly products: CatalogProduct[] = [
    {
      name: 'Taza artesanal',
      category: 'Cerámica',
      price: '$ 89.000',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Bolso de cuero',
      category: 'Accesorios',
      price: '$ 249.000',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Vela aromática',
      category: 'Hogar',
      price: '$ 62.000',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Cojín tejido',
      category: 'Textiles',
      price: '$ 118.000',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    },
  ];

  readonly benefits: CatalogBenefit[] = [
    {
      icon: 'pi-mobile',
      title: 'Tu propio catálogo digital',
      text: 'Un espacio profesional con tu marca para mostrar todo lo que ofreces.',
    },
    {
      icon: 'pi-th-large',
      title: 'Productos organizados por categorías',
      text: 'Tus clientes encuentran rápido lo que buscan, sin desorden ni confusión.',
    },
    {
      icon: 'pi-link',
      title: 'Comparte un solo enlace',
      text: 'Envía tu catálogo por WhatsApp, redes sociales o la biografía de tu perfil.',
    },
    {
      icon: 'pi-whatsapp',
      title: 'Pedidos y consultas por WhatsApp',
      text: 'Tus clientes preguntan y piden directo, sin intermediarios ni fricción.',
    },
    {
      icon: 'pi-shopping-bag',
      title: 'Administración sencilla',
      text: 'Actualiza tus productos, precios y stock fácilmente desde tu panel.',
    },
  ];

  readonly steps: CatalogStep[] = [
    {
      n: '01',
      title: 'Regístrate hoy',
      text: 'Participa por uno de los 5 cupos gratuitos para el lanzamiento.',
    },
    {
      n: '02',
      title: 'Recibe tu acceso',
      text: `Si eres seleccionado, el ${this.launchDate} recibirás tu código por correo.`,
    },
    {
      n: '03',
      title: 'Configura tu catálogo',
      text: 'Sube tus productos y personaliza tu tienda en minutos.',
    },
    {
      n: '04',
      title: 'Vende sin comisiones',
      text: 'Disfruta de 20 días gratis de SAMTS Catalog sin compromiso.',
    },
  ];

  ngOnInit() {
    // Solo ejecutar en el browser: en SSR las peticiones HTTP cuelgan la app
    if (isPlatformBrowser(this.platformId)) {
      this.refreshStats();
      this.analytics.track('campaign_view', { campaign: this.campaignId });
    }
  }

  refreshStats() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.leadApi.getCampaignStats(this.campaignId).subscribe({
      next: (stats) => this.campaignStats.set(stats),
      error: () => {
        // Fallback por defecto si el servidor aún está iniciando
        this.campaignStats.set({
          campaign: this.campaignId,
          total: 0,
          selected: 0,
          remaining: 5,
          waitlist: 0,
          maxSlots: 5
        });
      }
    });
  }

  selectBusinessType(value: string): void {
    this.selectedBusinessType.set(this.selectedBusinessType() === value ? '' : value);
  }

  openRegistration(): void {
    this.registrationOpen.set(true);
    this.analytics.track('campaign_form_open', { campaign: this.campaignId });
  }

  closeRegistration(): void {
    this.registrationOpen.set(false);
    setTimeout(() => {
      this.registrationResult.set(null);
      this.errorMessage.set(null);
      this.name = '';
      this.email = '';
      this.whatsapp = '';
      this.businessName = '';
      this.acceptDataPolicy = false;
    }, 300);
  }

  onSubmitRegistration(): void {
    if (!this.name.trim() || !this.email.trim() || !this.whatsapp.trim()) {
      this.errorMessage.set('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!this.acceptDataPolicy) {
      this.errorMessage.set('Debes aceptar la política de tratamiento de datos.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const utm = this.utmService.getUtmParams();
    const payload = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      whatsapp: this.whatsapp.trim(),
      businessName: this.businessName.trim(),
      businessType: this.selectedBusinessType() || 'General',
      solutionInterest: 'SAMTS Catalog',
      campaign: this.campaignId,
      source: 'home_catalog_campaign',
      landingPage: isPlatformBrowser(this.platformId) ? window.location.pathname : undefined,
      utmSource: utm['utm_source'],
      utmMedium: utm['utm_medium'],
      utmCampaign: utm['utm_campaign'],
    };

    this.leadApi.registerCampaign(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const result = res.status === 'SELECTED' ? 'selected' : 'waitlist';
        this.registrationResult.set(result);
        this.refreshStats();
        
        this.analytics.track('campaign_form_submit', { 
          campaign: this.campaignId,
          result: result
        });

        if (result === 'selected') {
          this.analytics.track('campaign_selected', { campaign: this.campaignId });
        } else {
          this.analytics.track('campaign_waitlist', { campaign: this.campaignId });
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.message || 'Hubo un problema con tu registro. Intenta de nuevo.';
        this.errorMessage.set(msg);
      }
    });
  }

  /** CTA principal: reutiliza el modal de captación de leads existente. */
  openCatalogInterest(): void {
    this.openRegistration();
  }

  openHowItWorks(): void {
    this.howItWorksOpen.set(true);
  }

  closeHowItWorks(): void {
    this.howItWorksOpen.set(false);
  }
}

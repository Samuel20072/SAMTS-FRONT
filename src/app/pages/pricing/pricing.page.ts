import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ConsultationModalComponent],
  templateUrl: './pricing.page.html',
  styles: [`
    /* ─── Page Layout ─── */
    .pricing-page {
      min-height: 100vh;
      background-color: #DFE0DE;
      position: relative;
      overflow: hidden;
      padding-bottom: 5rem;
    }

    .pricing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ─── Ambient Glows ─── */
    .pricing-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }
    .pricing-glow--1 {
      width: 500px; height: 500px;
      top: 5%; right: 5%;
      background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
    }
    .pricing-glow--2 {
      width: 600px; height: 600px;
      bottom: 10%; left: -5%;
      background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
    }

    /* ─── Hero ─── */
    .pricing-hero {
      position: relative;
      z-index: 1;
      padding: 6rem 0 3rem;
      text-align: center;
    }
    .pricing-eyebrow {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #2563eb;
      text-transform: uppercase;
      display: block;
      margin-bottom: 1.25rem;
    }
    .pricing-title {
      font-family: var(--font-display) !important;
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 800 !important;
      color: #0f172a !important;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
    }
    .pricing-subtitle {
      font-size: 1.05rem;
      color: #475569;
      max-width: 560px;
      margin: 0 auto;
      line-height: 1.65;
      font-weight: 400;
    }
    .hidden-mobile { display: none; }
    @media (min-width: 600px) { .hidden-mobile { display: inline; } }

    /* ─── Grid ─── */
    .pricing-grid-section {
      position: relative;
      z-index: 1;
      padding: 2rem 0 3rem;
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .pricing-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
    }

    /* ─── Cards ─── */
    .pricing-card {
      position: relative;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 24px;
      padding: 2.25rem 2rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      box-shadow: 0 4px 24px -4px rgba(0,0,0,0.06);
    }
    .pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px -8px rgba(0,0,0,0.10);
      border-color: rgba(0,0,0,0.12);
    }
    .pricing-card--featured {
      background: rgba(255,255,255,0.92) !important;
      border-color: rgba(37,99,235,0.35) !important;
      box-shadow: 0 8px 40px -8px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.15) !important;
      transform: translateY(-8px);
    }
    .pricing-card--featured:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 50px -8px rgba(37,99,235,0.25), 0 0 0 1px rgba(37,99,235,0.2) !important;
    }

    /* Badge */
    .pricing-card__badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 5px 18px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px -1px rgba(37,99,235,0.4);
      white-space: nowrap;
    }

    .pricing-card__body { flex: 1; }
    .pricing-card__header { margin-bottom: 1.5rem; }
    .pricing-card__name {
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 0.6rem;
    }
    .pricing-card__name--blue { color: #2563eb; }
    .pricing-card__desc {
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.55;
      min-height: 48px;
    }

    /* Price */
    .pricing-card__price-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 1.25rem 0;
    }
    .pricing-card__since {
      font-size: 0.7rem;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.25rem;
    }
    .pricing-card__price {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 3vw, 2rem);
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .pricing-card__usd {
      margin-top: 0.35rem;
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 9999px;
      background: rgba(37,99,235,0.08);
      border: 1px solid rgba(37,99,235,0.18);
      font-size: 0.75rem;
      font-weight: 600;
      color: #2563eb;
    }
    .pricing-card__period {
      margin-top: 0.6rem;
      font-size: 0.68rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Divider */
    .pricing-card__divider {
      height: 1px;
      background: rgba(0,0,0,0.07);
      margin: 1.25rem 0;
    }

    /* Features */
    .pricing-card__features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }
    .pricing-card__feature {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.45;
    }
    .pricing-card__check {
      width: 16px; height: 16px;
      min-width: 16px;
      background: rgba(37,99,235,0.1);
      border: 1px solid rgba(37,99,235,0.35);
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      color: #2563eb;
      margin-top: 1px;
    }
    .pricing-card__bullet {
      display: flex; align-items: center; gap: 3px;
      min-width: 16px; padding-top: 7px;
    }
    .pricing-card__bullet span {
      width: 2px; height: 10px;
      background: #94a3b8;
      border-radius: 2px;
    }

    /* CTA */
    .pricing-card__cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-family: var(--font-body);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
      background: rgba(241,245,249,0.8);
      color: #334155;
      transition: all 0.22s ease;
    }
    .pricing-card__cta:hover {
      background: rgba(226,232,240,0.9);
      border-color: rgba(0,0,0,0.14);
    }
    .pricing-card__cta--featured {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      color: #ffffff !important;
      border-color: transparent !important;
      box-shadow: 0 4px 16px -2px rgba(37,99,235,0.4);
    }
    .pricing-card__cta--featured:hover {
      background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 22px -2px rgba(37,99,235,0.5);
    }

    /* Trust Row */
    .pricing-trust {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      margin-top: 3rem;
      padding-top: 2.5rem;
      border-top: 1px solid rgba(0,0,0,0.07);
      flex-wrap: wrap;
    }
    .pricing-trust__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .pricing-trust__item i { color: #2563eb; font-size: 0.9rem; }
  `]
})
export class PricingPage {
  modalService = inject(ConsultationService);
  
  openConsultation() {
    this.modalService.open();
  }

  plans = [
    {
      name: 'Landing Page',
      priceCOP: '$900.000 COP',
      priceUSD: '$225 USD',
      period: 'pago único - entrega en 7 a 10 días',
      description: 'Presencia digital moderna y optimizada para captar clientes potenciales desde el primer día.',
      features: [
        'Diseño premium',
        'Responsive',
        'Formulario de contacto',
        'Botón de WhatsApp',
        'SEO básico',
        'Hosting'
      ],
      highlight: false
    },
    {
      name: 'Sitio Web Profesional',
      priceCOP: '$2.500.000 COP',
      priceUSD: '$625 USD',
      period: 'pago único - entrega en 10 a 14 días',
      description: 'Plataforma completa para posicionar tu marca con múltiples páginas, blog y panel de administración.',
      features: [
        'Varias páginas',
        'Blog',
        'Diseño personalizado',
        'SEO básico',
        'Formularios avanzados',
        'Panel administrativo (si aplica)'
      ],
      highlight: true
    },
    {
      name: 'Soluciones Personalizadas',
      priceCOP: '$4.000.000 COP',
      priceUSD: '$1.000 USD',
      period: 'pago único - según requerimientos',
      description: 'El valor final depende de los requerimientos específicos del proyecto.',
      features: [
        'Plataformas',
        'Sistemas administrativos',
        'E-commerce avanzado',
        'Automatizaciones',
        'Integraciones'
      ],
      highlight: false
    }
  ];
}

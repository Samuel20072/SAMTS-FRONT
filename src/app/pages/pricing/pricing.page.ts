import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { ConsultationService } from '../../services/consultation.service';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface NeedOption {
  id: string;
  label: string;
  icon: string;
  recommendedSolution: string;
  description: string;
  actionType: 'consult' | 'samuel';
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ConsultationModalComponent, AnimateOnScrollDirective],
  templateUrl: './pricing.page.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .pricing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ═════════════════════════════════════════════════════════
       SECCIÓN 1 (OSCURA): Hero + Selector de Soluciones
       ═════════════════════════════════════════════════════════ */
    .pricing-hero-section {
      background-color: #030712;
      color: #F8FAFC;
      position: relative;
      overflow: hidden;
      padding: 7rem 0 5rem;
    }

    .pricing-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
    }
    .pricing-glow--1 {
      width: 550px; height: 550px;
      top: 0%; right: -5%;
      background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
    }
    .pricing-glow--2 {
      width: 600px; height: 600px;
      bottom: 5%; left: -5%;
      background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
    }

    .pricing-hero-header {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .pricing-eyebrow-dark {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.18em;
      color: #60A5FA;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 1.25rem;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
    }
    .pricing-title-dark {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 800 !important;
      color: #FFFFFF !important;
      letter-spacing: -0.03em;
      line-height: 1.12;
      margin-bottom: 1.25rem;
    }
    .pricing-subtitle-dark {
      font-size: 1.1rem;
      color: #94A3B8 !important;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.65;
      font-weight: 400;
    }
    .hidden-mobile { display: none; }
    @media (min-width: 600px) { .hidden-mobile { display: inline; } }

    /* Selector de Necesidades */
    .needs-card-container {
      position: relative;
      z-index: 1;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 24px;
      padding: 3rem 2.25rem 2.5rem;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(16px);
    }
    .needs-header {
      text-align: center !important;
      max-width: 680px;
      margin: 0 auto 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .needs-eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      font-weight: 750;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #60A5FA;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
    }
    .needs-main-title {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(1.8rem, 3.5vw, 2.3rem);
      font-weight: 800 !important;
      color: #FFFFFF !important;
      letter-spacing: -0.02em;
      text-align: center !important;
      margin: 0 auto 0.75rem !important;
      line-height: 1.2;
      width: 100%;
    }
    .needs-subtitle {
      font-size: 0.95rem;
      color: #CBD5E1 !important;
      text-align: center !important;
      line-height: 1.6;
      margin: 0 auto;
      max-width: 540px;
      width: 100%;
    }
    .need-card-btn {
      text-align: left;
      padding: 1.35rem 1.4rem;
      border-radius: 1.15rem;
      border: 1px solid rgba(51, 65, 85, 0.8);
      background: rgba(2, 6, 23, 0.75);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.25s ease;
      color: #F8FAFC;
    }
    .need-card-btn:hover {
      border-color: rgba(96, 165, 250, 0.6);
      background: rgba(30, 58, 138, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
    }
    .need-card-btn.active {
      border-color: #3B82F6;
      background: rgba(37, 99, 235, 0.18);
      box-shadow: 0 0 25px rgba(37, 99, 235, 0.35);
    }
    .need-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF !important;
      margin-bottom: 0.4rem;
      font-family: var(--font-display, sans-serif);
    }
    .need-desc {
      font-size: 0.85rem;
      color: #CBD5E1 !important;
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }
    .need-action-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      font-weight: 700;
      color: #60A5FA;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(51, 65, 85, 0.5);
    }

    /* ═════════════════════════════════════════════════════════
       SECCIÓN 2 (CLARA): Planes Principales de Inversión
       ═════════════════════════════════════════════════════════ */
    .pricing-plans-section {
      background-color: #F8FAFC;
      color: #0F172A;
      position: relative;
      padding: 5.5rem 0 6rem;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
    }

    .pricing-plans-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .pricing-eyebrow-light {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.18em;
      color: #2563EB;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 1rem;
      background: rgba(37, 99, 235, 0.08);
      border: 1px solid rgba(37, 99, 235, 0.2);
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
    }
    .pricing-title-light {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(2.2rem, 4.5vw, 3.2rem);
      font-weight: 800 !important;
      color: #0F172A !important;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .pricing-subtitle-light {
      font-size: 1.05rem;
      color: #475569 !important;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.6;
      font-weight: 400;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
      align-items: stretch;
    }
    @media (max-width: 960px) {
      .pricing-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
    }

    /* Tarjetas de Planes (Estilo Claro) */
    .plan-card-light {
      position: relative;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      padding: 2.5rem 2rem 2.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .plan-card-light:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.12);
      border-color: #CBD5E1;
    }
    .plan-card-light--featured {
      border: 2px solid #2563EB !important;
      box-shadow: 0 20px 45px -10px rgba(37, 99, 235, 0.18), 0 0 0 1px rgba(37, 99, 235, 0.1) !important;
      transform: translateY(-6px);
    }
    .plan-card-light--featured:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 55px -10px rgba(37, 99, 235, 0.28) !important;
    }

    .plan-card-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 6px 20px;
      border-radius: 9999px;
      box-shadow: 0 4px 18px rgba(37, 99, 235, 0.45);
      white-space: nowrap;
    }

    .plan-card-body { flex: 1; }
    .plan-card-header { margin-bottom: 1.5rem; }
    .plan-card-name {
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 0.6rem;
    }
    .plan-card-name--blue { color: #2563EB; }
    .plan-card-desc {
      font-size: 0.88rem;
      color: #475569 !important;
      line-height: 1.6;
      min-height: 48px;
    }

    /* Precio */
    .plan-card-price-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 1.25rem 0;
    }
    .plan-card-since {
      font-size: 0.7rem;
      font-weight: 750;
      color: #2563EB;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 0.35rem;
    }
    .plan-card-price {
      font-family: var(--font-display, 'Outfit', sans-serif);
      font-size: clamp(1.8rem, 3.2vw, 2.3rem);
      font-weight: 850;
      color: #0F172A !important;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .plan-card-usd {
      margin-top: 0.45rem;
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(37, 99, 235, 0.08);
      border: 1px solid rgba(37, 99, 235, 0.2);
      font-size: 0.78rem;
      font-weight: 700;
      color: #2563EB;
    }
    .plan-card-period {
      margin-top: 0.75rem;
      font-size: 0.7rem;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .plan-card-divider {
      height: 1px;
      background: #E2E8F0;
      margin: 1.4rem 0;
    }

    /* Características */
    .plan-card-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
      padding: 0;
    }
    .plan-card-feature {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.88rem;
      color: #1E293B !important;
      line-height: 1.5;
    }
    .plan-card-check {
      width: 18px; height: 18px;
      min-width: 18px;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(37, 99, 235, 0.3);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: #2563EB;
      margin-top: 2px;
    }
    .plan-card-bullet {
      display: flex; align-items: center; gap: 3px;
      min-width: 18px; padding-top: 7px;
    }
    .plan-card-bullet span {
      width: 2px; height: 10px;
      background: #2563EB;
      border-radius: 2px;
    }

    /* No incluidos */
    .plan-card-not-included {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid #E2E8F0;
      font-size: 0.78rem;
      color: #64748B;
    }
    .plan-card-not-included-title {
      font-weight: 700;
      color: #475569;
      display: block;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.7rem;
    }
    .plan-card-not-included-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      padding: 0;
      margin: 0;
    }
    .plan-card-not-included-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748B !important;
      font-size: 0.8rem;
    }
    .plan-card-not-included-item i {
      color: #94A3B8;
      font-size: 0.65rem;
    }

    /* Botones CTA */
    .plan-card-cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 1rem 1.5rem;
      border-radius: 14px;
      font-family: var(--font-body);
      font-size: 0.85rem;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      border: 1px solid #0F172A;
      background: #0F172A;
      color: #FFFFFF;
      transition: all 0.25s ease;
      margin-top: 1.5rem;
    }
    .plan-card-cta:hover {
      background: #1E293B;
      border-color: #1E293B;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.25);
    }
    .plan-card-cta--featured {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      color: #FFFFFF !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 25px -4px rgba(37, 99, 235, 0.5);
    }
    .plan-card-cta--featured:hover {
      background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
      transform: translateY(-2px);
      box-shadow: 0 12px 30px -4px rgba(37, 99, 235, 0.65);
    }

    /* ═════════════════════════════════════════════════════════
       SECCIÓN 3 (OSCURA): Categorías Comerciales & Trust Bar
       ═════════════════════════════════════════════════════════ */
    .pricing-comp-section {
      background-color: #070B18;
      color: #F8FAFC;
      position: relative;
      overflow: hidden;
      padding: 7rem 0 6rem;
    }
    .pricing-comp-section .pricing-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(140px);
      pointer-events: none;
      z-index: 0;
    }
    .pricing-comp-glow--1 {
      width: 500px; height: 500px;
      top: 15%; right: -5%;
      background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
    }
    .pricing-comp-glow--2 {
      width: 500px; height: 500px;
      bottom: 20%; left: -5%;
      background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    }

    .pricing-comp-header {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-bottom: 4.5rem;
    }
    .pricing-comp-eyebrow {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.18em;
      color: #60A5FA;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      padding: 0.4rem 1.1rem;
      border-radius: 9999px;
    }
    .pricing-comp-title {
      font-family: var(--font-display, 'Outfit', sans-serif) !important;
      font-size: clamp(2.2rem, 4.5vw, 3.2rem);
      font-weight: 800 !important;
      color: #FFFFFF !important;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .pricing-comp-subtitle {
      font-size: 1.05rem;
      color: #94A3B8 !important;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.6;
      font-weight: 400;
    }

    /* Grid de Categorías con espacio generoso y centrado */
    .comp-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.25rem;
      align-items: stretch;
      max-width: 1180px;
      margin: 0 auto;
    }
    @media (max-width: 1080px) {
      .comp-grid { grid-template-columns: repeat(2, 1fr); gap: 1.75rem; }
    }
    @media (max-width: 720px) {
      .comp-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; gap: 1.75rem; }
    }

    /* Tarjeta de Categoría Centrada y Espaciosa */
    .comp-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(59, 130, 246, 0.22);
      border-radius: 24px;
      padding: 2.5rem 2.25rem 2.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .comp-card:hover {
      border-color: rgba(96, 165, 250, 0.55);
      background: rgba(15, 23, 42, 0.95);
      transform: translateY(-4px);
      box-shadow: 0 20px 45px -10px rgba(37, 99, 235, 0.25);
    }

    .comp-card__top {
      text-align: center;
      margin-bottom: 1.25rem;
    }
    .comp-card__meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      margin-bottom: 1.15rem;
      flex-wrap: wrap;
    }
    .comp-card__badge {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      color: #60A5FA;
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
    }
    .comp-card__time {
      font-size: 0.75rem;
      color: #94A3B8;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(30, 41, 59, 0.6);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid rgba(51, 65, 85, 0.5);
    }
    .comp-card__name {
      font-family: var(--font-display, 'Outfit', sans-serif);
      font-size: 1.25rem;
      font-weight: 750;
      color: #FFFFFF !important;
      letter-spacing: -0.01em;
      margin-bottom: 0.5rem;
    }
    .comp-card__scope {
      font-size: 0.85rem;
      color: #CBD5E1 !important;
      line-height: 1.6;
      min-height: 44px;
      margin-bottom: 1.5rem;
    }

    /* Caja de Inversión Centrada */
    .comp-card__price-box {
      background: rgba(2, 6, 23, 0.75);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 16px;
      padding: 1.1rem 1.25rem;
      margin-bottom: 1.75rem;
      text-align: center;
    }
    .comp-card__price-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #60A5FA;
      display: block;
      margin-bottom: 0.35rem;
    }
    .comp-card__price-value {
      font-family: var(--font-display, 'Outfit', sans-serif);
      font-size: 1.15rem;
      font-weight: 850;
      color: #FFFFFF !important;
      letter-spacing: -0.01em;
    }

    /* Lista de Beneficios */
    .comp-card__highlights {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 0;
      margin: 0 0 2rem;
      text-align: left;
    }
    .comp-card__highlight-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #E2E8F0 !important;
      line-height: 1.45;
    }
    .comp-card__check-icon {
      width: 20px;
      height: 20px;
      min-width: 20px;
      border-radius: 6px;
      background: rgba(37, 99, 235, 0.18);
      border: 1px solid rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #60A5FA;
      font-size: 0.65rem;
    }

    /* Botón de Cotización */
    .comp-card__cta {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 0.95rem 1.5rem;
      border-radius: 14px;
      font-family: var(--font-body);
      font-size: 0.82rem;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(71, 85, 105, 0.8);
      color: #FFFFFF;
      transition: all 0.25s ease;
      margin-top: auto;
    }
    .comp-card__cta:hover {
      background: #2563EB;
      border-color: #3B82F6;
      color: #FFFFFF;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -4px rgba(37, 99, 235, 0.4);
    }

    /* Trust Row */
    .pricing-trust {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3.5rem;
      margin-top: 5.5rem;
      padding-top: 3.5rem;
      border-top: 1px solid rgba(51, 65, 85, 0.6);
      flex-wrap: wrap;
    }
    .pricing-trust__item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.82rem;
      font-weight: 650;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .pricing-trust__item i { color: #60A5FA; font-size: 1rem; }
  `]
})
export class PricingPage {
  modalService = inject(ConsultationService);
  samuel = inject(SamuelDiagnosisService);
  private router = inject(Router);

  selectedNeed = signal<string | null>(null);

  needs: NeedOption[] = [
    {
      id: 'clients',
      label: 'Conseguir más clientes',
      icon: 'pi-users',
      recommendedSolution: 'Landing Page o Sitio Web Profesional',
      description: 'Páginas diseñadas con copywriting persuasivo, carga ultrarrápida y llamadas a la acción directas hacia tu WhatsApp.',
      actionType: 'consult'
    },
    {
      id: 'catalog',
      label: 'Mostrar mis productos',
      icon: 'pi-images',
      recommendedSolution: 'Sitio Web Profesional con Catálogo Digital',
      description: 'Exhibe tus artículos o servicios con fotos, descripciones y precios actualizables desde un panel administrativo autónomo.',
      actionType: 'consult'
    },
    {
      id: 'ecommerce',
      label: 'Vender por internet',
      icon: 'pi-shopping-bag',
      recommendedSolution: 'Tienda Virtual (E-commerce)',
      description: 'Carrito de compras, cobro en línea mediante pasarelas seguras (Wompi, PayU, Stripe) y control de pedidos en tiempo real.',
      actionType: 'consult'
    },
    {
      id: 'management',
      label: 'Organizar mi negocio',
      icon: 'pi-sliders-h',
      recommendedSolution: 'Sistema de Gestión a Medida',
      description: 'Plataformas web para centralizar clientes, pedidos, inventario, reportes o flujos operativos que hoy manejas en Excel.',
      actionType: 'consult'
    },
    {
      id: 'automation',
      label: 'Automatizar tareas',
      icon: 'pi-bolt',
      recommendedSolution: 'Automatización con IA & Agentes',
      description: 'Respuestas automáticas inteligentes a clientes, integraciones entre tus aplicaciones y reducción de horas operativas.',
      actionType: 'consult'
    },
    {
      id: 'guidance',
      label: 'Necesito orientación',
      icon: 'pi-sparkles',
      recommendedSolution: 'Diagnóstico con Samuel AI',
      description: 'Samuel analiza el estado actual de tu negocio y te recomienda con precisión la solución tecnológica que te conviene.',
      actionType: 'samuel'
    }
  ];

  selectNeed(need: NeedOption) {
    this.selectedNeed.set(need.id);
    if (need.actionType === 'samuel') {
      this.samuel.startHome();
      this.router.navigate(['/']);
    } else {
      this.modalService.open({
        solutionInterest: need.recommendedSolution,
        mainProblem: need.label,
        source: 'pricing_needs_selector',
        notes: `El visitante seleccionó la necesidad: "${need.label}". Recomendación: ${need.recommendedSolution}.`
      });
    }
  }

  openConsultation(plan?: any) {
    if (plan) {
      this.modalService.open({
        solutionInterest: plan.name,
        source: 'pricing_page',
        notes: `El visitante consultó el plan "${plan.name}" (${plan.priceCOP}).`,
      });
    } else {
      this.modalService.open({ source: 'pricing_page' });
    }
  }

  plans = [
    {
      name: 'Landing Page',
      priceCOP: '$900.000 COP',
      priceUSD: '$225 USD',
      period: 'pago único - entrega en 7 a 10 días',
      description: 'Presencia digital moderna y optimizada para captar clientes potenciales desde el primer día.',
      features: [
        'Diseño premium responsive',
        'Optimización para conversión móvil',
        'Formulario de contacto funcional',
        'Botón directo a WhatsApp',
        'SEO técnico inicial',
        'Configuración de hosting y despliegue'
      ],
      notIncluded: [
        'Múltiples secciones o páginas',
        'Pasarela de cobros en línea',
        'Panel administrativo de productos'
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
        'Múltiples páginas estructuradas',
        'Blog o sección de novedades',
        'Diseño exclusivo a medida',
        'SEO avanzado y metaetiquetas',
        'Formularios avanzados y captura de leads',
        'Panel administrativo autogestionable (si aplica)'
      ],
      notIncluded: [
        'Pasarela de pagos transaccional compleja',
        'Sistemas ERP/CRM integrados a gran escala'
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
        'Plataformas SaaS a medida',
        'Sistemas web de gestión operativa',
        'E-commerce con pasarelas de pago',
        'Automatizaciones de flujos de trabajo',
        'Integración de Agentes de Inteligencia Artificial'
      ],
      notIncluded: [
        'Alcances no especificados en el acta de propuesta'
      ],
      highlight: false
    }
  ];

  comparisonCategories = [
    {
      name: 'Página Web Profesional',
      scope: 'Empresas y profesionales que buscan autoridad y posicionamiento.',
      price: '$2.500.000 COP',
      time: '10 - 14 días',
      badge: 'Más Vendida',
      highlights: ['Múltiples páginas', 'Diseño responsive', 'SEO técnico', 'Panel autoadministrable opcional']
    },
    {
      name: 'Catálogo Digital',
      scope: 'Comercios que desean exhibir inventario sin pasarela bancaria.',
      price: 'Cotización según volumen',
      time: '10 - 15 días',
      badge: 'Comercial',
      highlights: ['Visualización de catálogo', 'Pedidos directo a WhatsApp', 'Panel de administración autónomo']
    },
    {
      name: 'Tienda Virtual',
      scope: 'Marcas listas para procesar ventas con tarjeta y transferencias 24/7.',
      price: 'Desde $4.000.000 COP',
      time: '15 - 25 días',
      badge: 'E-Commerce',
      highlights: ['Pasarelas Wompi/PayU/Stripe', 'Carrito de compras', 'Gestión de inventario y pedidos']
    },
    {
      name: 'Sistema de Gestión',
      scope: 'Negocios que necesitan ordenar clientes, operaciones o finanzas.',
      price: 'Propuesta a medida',
      time: 'Evaluación previa',
      badge: 'Software Web',
      highlights: ['Base de datos PostgreSQL', 'Roles y permisos', 'Módulos administrativos personalizados']
    },
    {
      name: 'Automatización con IA',
      scope: 'Empresas con tareas repetitivas o alto flujo de atención al cliente.',
      price: 'Propuesta a medida',
      time: 'Evaluación previa',
      badge: 'IA & Bots',
      highlights: ['Agentes de atención', 'Integración con APIs y WhatsApp', 'Generación de contenido y datos']
    },
    {
      name: 'Solución Personalizada',
      scope: 'Proyectos con arquitectura tecnológica y requerimientos únicos.',
      price: 'Desde $4.000.000 COP',
      time: 'Según alcance',
      badge: 'Full-Stack',
      highlights: ['Angular 21 + NestJS', 'Arquitectura escalable', 'Soporte y despliegue a medida']
    }
  ];
}

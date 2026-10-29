import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ConsultationModalComponent, AnimateOnScrollDirective],
  templateUrl: './portfolio.page.html',
  styles: [`
    /* ─── Page Layout ─── */
    .port-page {
      min-height: 100vh;
      background-color: #DFE0DE;
      position: relative;
      overflow: hidden;
      padding-bottom: 6rem;
      font-family: var(--font-body, 'Inter', sans-serif);
    }

    .port-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ─── Ambient Glows ─── */
    .port-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }
    .port-glow--1 {
      width: 500px; height: 500px;
      top: 5%; left: 15%;
      background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
    }
    .port-glow--2 {
      width: 600px; height: 600px;
      bottom: 15%; right: 5%;
      background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
    }

    /* ─── Hero ─── */
    .port-hero {
      position: relative;
      z-index: 1;
      padding: 6rem 0 3.5rem;
      text-align: center;
    }
    .port-eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #2563eb;
      display: inline-block;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
    }
    .port-title {
      font-family: var(--font-display, 'Space Grotesk', sans-serif);
      font-size: 2.75rem;
      font-weight: 800;
      color: #0b0f19;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin: 0 0 1rem;
    }
    .port-subtitle {
      font-size: 1.05rem;
      color: #475569;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* ─── Projects Section ─── */
    .port-projects {
      position: relative;
      z-index: 1;
    }
    .port-projects__list {
      display: flex;
      flex-direction: column;
      gap: 5rem;
    }
    .port-project {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
      align-items: center;
    }
    @media (min-width: 1024px) {
      .port-project {
        flex-direction: row;
        gap: 3.5rem;
      }
      .port-project--reversed {
        flex-direction: row-reverse;
      }
    }

    /* ─── Mockup Wrapper ─── */
    .port-mockup-wrap {
      flex: 1;
      width: 100%;
      position: relative;
    }
    .port-mockup-glow {
      position: absolute;
      inset: -10px;
      border-radius: 2rem;
      background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(99,102,241,0.06));
      filter: blur(25px);
      opacity: 0.6;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }
    .port-mockup-wrap:hover .port-mockup-glow {
      opacity: 1;
    }

    /* ─── Browser Card ─── */
    .port-browser {
      position: relative;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.08);
      aspect-ratio: 4/3;
      display: flex;
      flex-direction: column;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .port-browser:hover {
      border-color: rgba(37,99,235,0.25);
      box-shadow: 0 25px 50px -18px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1);
    }
    .port-browser__bar {
      height: 38px;
      background: #f8fafc;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .port-browser__dots {
      display: flex;
      gap: 6px;
    }
    .port-browser__dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }
    .port-browser__dot--red { background: #ef4444; }
    .port-browser__dot--yellow { background: #f59e0b; }
    .port-browser__dot--green { background: #10b981; }
    .port-browser__url {
      flex: 1;
      max-width: 220px;
      margin: 0 auto;
      background: #edf2f7;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 6px;
      height: 22px;
      padding: 0 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
      font-family: monospace;
      user-select: none;
    }
    .port-browser__url-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .port-browser__spacer {
      width: 36px;
    }
    .port-browser__content {
      flex: 1;
      background: #f8fafc;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .port-browser__content--padded {
      padding: 1.25rem;
    }
    .port-browser__video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }

    /* ─── Mockup 1: E-commerce ─── */
    .port-mock-ecomm {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .port-mock-ecomm__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    .port-mock-product {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 0.75rem;
      padding: 0.6rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 95px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .port-mock-product__img {
      height: 42px;
      background: #f1f5f9;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .port-mock-product__bar {
      height: 7px;
      background: #e2e8f0;
      border-radius: 4px;
    }
    .port-mock-product__price {
      font-size: 9px;
      font-weight: 700;
      color: #0b0f19;
    }
    .port-mock-chart {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 0.75rem;
      padding: 0.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .port-mock-chart__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .port-mock-chart__label {
      height: 7px;
      width: 60px;
      background: #e2e8f0;
      border-radius: 4px;
    }
    .port-mock-chart__bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 0.5rem;
      height: 60px;
      padding-top: 0.5rem;
    }
    .port-mock-bar {
      flex: 1;
      background: rgba(37,99,235,0.18);
      border-radius: 3px 3px 0 0;
      transition: all 0.3s ease;
    }
    .port-mock-bar--active {
      background: #2563eb;
      box-shadow: 0 0 10px rgba(37,99,235,0.3);
    }

    /* ─── Mockup 2: Restaurant ─── */
    .port-mock-resto {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .port-mock-resto__nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
    .port-mock-bar-flat {
      height: 7px;
      background: #e2e8f0;
      border-radius: 4px;
    }
    .port-mock-resto__content {
      flex: 1;
      display: flex;
      gap: 0.75rem;
    }
    .port-mock-resto__hero {
      flex: 1;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 0.75rem;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .port-mock-resto__side {
      width: 35%;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 0.75rem;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .port-mock-resto__whatsapp {
      align-self: flex-end;
      background: #10b981;
      color: #ffffff;
      border-radius: 9999px;
      padding: 0.4rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }

    /* ─── Mockup 3: Placeholder ─── */
    .port-mock-placeholder {
      height: 100%;
      border: 1.5px dashed rgba(0,0,0,0.15);
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-align: center;
      padding: 1.5rem;
      background: rgba(255,255,255,0.4);
    }
    .port-mock-placeholder__icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.25rem;
    }
    .port-mock-placeholder__title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
    }
    .port-mock-placeholder__sub {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ─── Project Info ─── */
    .port-info {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .port-info__client {
      font-size: 0.72rem;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0;
    }
    .port-info__title {
      font-family: var(--font-display, 'Space Grotesk', sans-serif);
      font-size: 1.85rem;
      font-weight: 800;
      color: #0b0f19;
      letter-spacing: -0.02em;
      line-height: 1.25;
      margin: 0;
    }
    .port-info__desc {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.65;
      margin: 0;
    }
    .port-info__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      padding-top: 0.25rem;
    }
    .port-tag {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      color: #334155;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .port-info__metrics-wrap {
      border-top: 1px solid rgba(0,0,0,0.08);
      padding-top: 1.5rem;
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .port-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .port-metric__value {
      font-family: var(--font-display, 'Space Grotesk', sans-serif);
      font-size: 1.5rem;
      font-weight: 800;
      color: #0b0f19;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .port-metric__label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0.2rem 0 0;
    }
    .port-info__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .port-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s ease;
      font-family: var(--font-body, 'Inter', sans-serif);
    }
    .port-btn--outline {
      border: 1px solid rgba(37,99,235,0.3);
      background: rgba(37,99,235,0.06);
      color: #2563eb;
    }
    .port-btn--outline:hover {
      background: rgba(37,99,235,0.12);
      border-color: rgba(37,99,235,0.5);
      transform: translateY(-1px);
    }
    .port-btn--ghost {
      border: 1px solid rgba(0,0,0,0.1);
      background: #ffffff;
      color: #1e293b;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .port-btn--ghost:hover {
      background: #f8fafc;
      border-color: rgba(0,0,0,0.2);
      transform: translateY(-1px);
    }

    @media (max-width: 640px) {
      .port-title { font-size: 2rem; }
      .port-info__title { font-size: 1.5rem; }
      .port-metrics { grid-template-columns: repeat(2, 1fr); }
      .port-hero { padding: 4rem 0 2rem; }
      .port-projects__list { gap: 3.5rem; }
    }
  `]
})
export class PortfolioPage {
  modalService = inject(ConsultationService);
  projects = [
    {
      title: 'E-commerce Premium & Panel Administrativo',
      client: 'Luxury Store',
      description: 'Plataforma de comercio electrónico de alta gama diseñada para calzado y moda exclusiva. Integra pasarela de pagos, catálogo dinámico interactivo y un panel de administración completo que permite gestionar de manera autónoma el stock, productos, pedidos e inventario en tiempo real.',
      metrics: [
        { label: 'ADMINISTRACIÓN', value: '100% Autónoma' },
        { label: 'PROCESO DE PAGO', value: '< 1 Minuto' },
        { label: 'DISEÑO UI/UX', value: 'Premium' }
      ],
      tags: ['Angular', 'Node.js', 'PostgreSQL', 'Express', 'Admin Panel', 'E-commerce'],
      isPlaceholder: false,
      videoUrl: '/videos/luxury-store.mp4',
      siteUrl: 'https://luxury-store.co',
      videoError: false,
      ctaSimilar: {
        label: 'Quiero una tienda similar',
        solutionInterest: 'Tienda Virtual con Panel Administrativo',
        businessType: 'E-commerce / Tienda online',
        mainProblem: 'Vender productos por internet con gestión autónoma de inventario',
      },
      demoRoute: '/demos/luxury-store',
    },
    {
      title: 'Portal Gastronómico & Sistema de Reservas',
      client: 'Santuario Café & Restaurante',
      description: 'Sitio web oficial y panel administrativo para uno de los destinos gastronómicos más emblemáticos de Circasia, Quindío. Permite la visualización y edición en tiempo real del menú digital interactivo, la promoción de eventos y celebraciones, y la gestión digital del flujo de clientes.',
      metrics: [
        { label: 'MENÚ DIGITAL', value: 'En Vivo' },
        { label: 'ADMINISTRACIÓN', value: 'Panel Web' },
        { label: 'UBICACIÓN', value: 'Circasia, Q.' }
      ],
      tags: ['Angular', 'Node.js', 'Admin Panel', 'Tailwind CSS', 'Gestión de Menú'],
      isPlaceholder: false,
      videoUrl: '/videos/santuario-circasia.mp4',
      siteUrl: 'https://santuario-circasia.com',
      videoError: false,
      ctaSimilar: {
        label: 'Quiero algo así para mi negocio',
        solutionInterest: 'Sitio Web con Menú Digital y Panel Administrativo',
        businessType: 'Restaurante / Café / Gastronomía',
        mainProblem: 'Mostrar menú actualizado y gestionar reservas de manera digital',
      },
      demoRoute: '/demos/santuario',
    },
    {
      title: 'Tu proyecto podría estar aquí.',
      client: 'PRÓXIMAMENTE',
      description: 'Trabajamos contigo para diseñar y desarrollar soluciones web a medida con paneles administrativos autogestionables, integraciones API y alto rendimiento.',
      metrics: [],
      tags: ['Angular', 'NestJS', 'SAMTS - AI'],
      isPlaceholder: true,
      videoUrl: undefined,
      siteUrl: undefined,
      videoError: false,
      ctaSimilar: null,
      demoRoute: null,
    }
  ];

  openSimilarConsultation(project: any): void {
    if (!project.ctaSimilar) return;
    this.modalService.open({
      solutionInterest: project.ctaSimilar.solutionInterest,
      businessType: project.ctaSimilar.businessType,
      mainProblem: project.ctaSimilar.mainProblem,
      source: 'portfolio',
      notes: `El cliente vio el caso de ${project.client} y desea algo similar.`,
    });
  }

  openGeneralConsultation(): void {
    this.modalService.open({ source: 'portfolio_cta' });
  }
}

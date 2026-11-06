import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

interface WorkStep {
  number: string;
  title: string;
  description: string;
  clientAction: string;
  icon: string;
}

@Component({
  selector: 'app-how-we-work',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './how-we-work.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .hww-section {
      background-color: var(--color-surface-2);
      color: var(--color-ink);
      position: relative;
      overflow: hidden;
      padding: 6rem 1.5rem 7rem;
      width: 100%;
    }
    .hww-container {
      max-width: 860px;
      margin: 0 auto;
      width: 100%;
      position: relative;
      z-index: 10;
    }
    .hww-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .hww-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent);
      background: var(--color-accent-soft);
      border: 1px solid rgba(49, 94, 251, 0.18);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    .hww-title {
      font-family: var(--font-display) !important;
      font-size: clamp(2.2rem, 4.5vw, 3.5rem);
      font-weight: 800 !important;
      color: var(--color-ink) !important;
      line-height: 1.15;
      letter-spacing: -0.025em;
      margin-bottom: 1.25rem;
      text-align: center;
    }
    .hww-highlight {
      color: var(--color-accent);
    }
    .hww-subtitle {
      font-size: 1.05rem;
      color: var(--color-ink-2) !important;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.6;
      text-align: center;
    }
    .hww-steps-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 4rem;
      width: 100%;
    }
    .hww-step-item {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      width: 100%;
    }
    @media (max-width: 640px) {
      .hww-step-item {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
    .hww-step-number-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .hww-number-badge {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #ffffff;
      border: 1px solid var(--color-line);
      color: var(--color-accent);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .hww-card {
      flex: 1;
      width: 100%;
      background: #ffffff;
      border: 1px solid var(--color-line);
      border-radius: 1.25rem;
      padding: 1.75rem 2rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hww-card:hover {
      border-color: rgba(49, 94, 251, 0.35);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .hww-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .hww-step-title {
      font-size: 1.25rem;
      font-weight: 750 !important;
      color: var(--color-ink) !important;
      margin: 0;
      font-family: var(--font-display) !important;
    }
    .hww-step-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--color-accent-soft);
      border: 1px solid rgba(49, 94, 251, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
      font-size: 0.85rem;
    }
    .hww-step-desc {
      font-size: 0.92rem;
      color: var(--color-ink-2) !important;
      line-height: 1.6;
      margin: 0.5rem 0 1rem 0;
    }
    .hww-client-box {
      background: var(--color-surface-2);
      border: 1px solid var(--color-line);
      border-radius: 0.85rem;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
    }
    .hww-client-box i {
      color: var(--color-accent);
    }
    .hww-client-text {
      font-size: 0.82rem;
      color: var(--color-ink) !important;
      line-height: 1.5;
      margin: 0;
    }
    .hww-client-lead {
      color: var(--color-accent);
      font-weight: 700;
    }
    .hww-cta-banner {
      margin-top: 5rem;
      position: relative;
      background: #ffffff;
      border: 1px solid var(--color-line);
      border-radius: 2rem;
      padding: 3.5rem 2rem;
      text-align: center;
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .hww-cta-glow {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 450px;
      height: 220px;
      background: radial-gradient(ellipse, rgba(49, 94, 251, 0.12) 0%, transparent 70%);
      pointer-events: none;
      filter: blur(50px);
    }
    .hww-cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-accent);
      background: var(--color-accent-soft);
      border: 1px solid rgba(49, 94, 251, 0.18);
      padding: 0.45rem 1.15rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 2;
    }
    .hww-cta-title {
      font-family: var(--font-display) !important;
      font-size: clamp(2rem, 3.8vw, 2.75rem);
      font-weight: 800 !important;
      color: var(--color-ink) !important;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0 auto 1rem auto;
      max-width: 650px;
      position: relative;
      z-index: 2;
    }
    .hww-cta-desc {
      font-size: 1.05rem;
      color: var(--color-ink-2) !important;
      max-width: 540px;
      margin: 0 auto 2.25rem auto;
      line-height: 1.6;
      position: relative;
      z-index: 2;
    }
    .hww-cta-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2.25rem;
      position: relative;
      z-index: 2;
    }
    .hww-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.05rem 2.2rem;
      background: var(--color-accent);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.98rem;
      border-radius: 1rem;
      border: 1px solid var(--color-accent);
      box-shadow: 0 10px 25px -8px rgba(49, 94, 251, 0.55);
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    .hww-btn-primary:hover {
      background: var(--color-violet-dark);
      border-color: var(--color-violet-dark);
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -8px rgba(49, 94, 251, 0.6);
    }
    .hww-btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.05rem 2rem;
      background: #ffffff;
      color: var(--color-ink);
      font-weight: 650;
      font-size: 0.95rem;
      border-radius: 1rem;
      border: 1px solid var(--color-line);
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: var(--shadow-sm);
    }
    .hww-btn-secondary i {
      color: var(--color-accent);
    }
    .hww-btn-secondary:hover {
      background: var(--color-surface-2);
      border-color: #d5d7dd;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .hww-trust-pills {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      padding-top: 1.75rem;
      border-top: 1px solid var(--color-line);
      position: relative;
      z-index: 2;
    }
    .hww-trust-item {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.82rem;
      color: var(--color-ink-2);
      font-weight: 550;
    }
    .hww-trust-item i {
      color: #10B981;
      font-size: 0.75rem;
    }
  
`]
})
export class HowWeWorkComponent {
  consultation = inject(ConsultationService);
  samuel = inject(SamuelDiagnosisService);

  steps: WorkStep[] = [
    {
      number: '01',
      title: 'Entendemos tu negocio',
      description: 'Comenzamos con una sesión de diagnóstico sin costo donde escuchamos tus objetivos, los problemas actuales y las expectativas de tu proyecto digital.',
      clientAction: 'El cliente comparte el contexto de su negocio, sus metas y lo que no ha funcionado en intentos anteriores.',
      icon: 'pi-search',
    },
    {
      number: '02',
      title: 'Definimos la solución',
      description: 'Con base en el diagnóstico, establecemos el alcance exacto del proyecto: qué funcionalidades incluye, cuánto tiempo tomará y cuál es la inversión real.',
      clientAction: 'El cliente revisa y aprueba la propuesta por escrito antes de iniciar cualquier desarrollo.',
      icon: 'pi-file-edit',
    },
    {
      number: '03',
      title: 'Diseñamos y desarrollamos',
      description: 'Construimos la solución acordada con actualizaciones de progreso para que el cliente esté informado en todo momento. No aparecemos solo al final.',
      clientAction: 'El cliente proporciona logotipos, contenidos, imágenes y accesos necesarios según el proyecto.',
      icon: 'pi-code',
    },
    {
      number: '04',
      title: 'Revisamos y entregamos',
      description: 'El cliente valida el resultado frente al alcance acordado. Se realizan los ajustes finales definidos en la propuesta antes de la entrega oficial.',
      clientAction: 'El cliente realiza las pruebas y aprueba la solución antes de que salga a producción.',
      icon: 'pi-check-circle',
    },
    {
      number: '05',
      title: 'Acompañamos la puesta en marcha',
      description: 'Explicamos el uso de la solución entregada para que el cliente pueda gestionarla de forma autónoma. El tipo de acompañamiento posterior queda definido en la propuesta.',
      clientAction: 'El cliente gestiona su plataforma de forma independiente desde el primer día.',
      icon: 'pi-rocket',
    },
  ];

  openConsultation(): void {
    this.consultation.open({ source: 'how_we_work' });
  }

  startDiagnosis(): void {
    this.samuel.startHome();
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  }
}

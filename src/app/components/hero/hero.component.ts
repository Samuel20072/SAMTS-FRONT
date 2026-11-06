import {
  Component,
  inject,
  signal,
  computed,
  effect,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { SamuelResultComponent } from '../samuel-result/samuel-result.component';
import { cdnUrl } from '../../core/cdn';

/* ══════════════════════════════════════════════════════════════
   SAMTS Hero — Curved Visual Showcase
   Galería horizontal de tarjetas sobre una curva 3D con desplazamiento
   continuo, loop infinito, arrastre (mouse/touch) e inercia.
   ══════════════════════════════════════════════════════════════ */

/** Distancia focal de la cámara virtual aplicada a cada tarjeta. */
const PERSPECTIVE = 1500;

/** Tipo de tarjeta: imagen real del proyecto o mockup conceptual en CSS. */
type HeroCardKind = 'image' | 'mock';

/** Variantes de mockup. Son conceptos visuales, NO capturas de proyectos reales. */
type HeroMockVariant = 'catalog' | 'app' | 'booking' | 'automation' | 'custom';

interface HeroCard {
  id: string;
  kind: HeroCardKind;
  /** Etiqueta visible de la solución representada. */
  label: string;
  /** Texto alternativo descriptivo (accesibilidad). */
  alt: string;
  /** Ruta local del asset real (se resuelve a Cloudinary con f_auto,q_auto). */
  img?: string;
  /** Variante del mockup conceptual (solo cuando kind === 'mock'). */
  mock?: HeroMockVariant;
}

interface LoopCard {
  uid: string;
  card: HeroCard;
  src: string;
  /** Índice global dentro del conjunto repetido: define la posición base. */
  index: number;
  isClone: boolean;
  /** Carga prioritaria (tarjetas visibles en el primer plano). */
  priority: boolean;
}

/**
 * Catálogo de soluciones. Las tarjetas `image` usan capturas reales que ya
 * existen en el proyecto; las tarjetas `mock` son composiciones CSS creadas
 * para ilustrar el tipo de solución (se rotulan como "concepto visual").
 */
const HERO_CARDS: HeroCard[] = [
  {
    id: 'store',
    kind: 'image',
    label: 'Tienda virtual',
    alt: 'Interfaz de tienda virtual de moda con catálogo de prendas',
    img: '/images/boutique/hero-v2.png',
  },
  {
    id: 'catalog',
    kind: 'mock',
    mock: 'catalog',
    label: 'Catálogo digital',
    alt: 'Concepto visual de catálogo digital de productos organizado en cuadrícula',
  },
  {
    id: 'business',
    kind: 'image',
    label: 'Sitios web',
    alt: 'Página web de restaurante con un plato destacado como imagen principal',
    img: '/images/restaurant/hero-pasta-v2.jpg',
  },
  {
    id: 'admin',
    kind: 'image',
    label: 'Sistemas admin.',
    alt: 'Sistema administrativo mostrado sobre un computador portátil',
    img: '/images/laptop_dashboard-v2.png',
  },
  {
    id: 'dashboard',
    kind: 'image',
    label: 'Dashboards IA',
    alt: 'Panel de control con métricas y analítica potenciada por inteligencia artificial',
    img: '/images/hero_ai_dashboard-v2.png',
  },
  {
    id: 'app',
    kind: 'mock',
    mock: 'app',
    label: 'Apps móviles',
    alt: 'Concepto visual de interfaz de aplicación móvil con listado y navegación inferior',
  },
  {
    id: 'ecommerce',
    kind: 'image',
    label: 'E-commerce',
    alt: 'Tienda en línea de productos tecnológicos con equipos electrónicos',
    img: '/images/tech/emetix-hero-v2.jpg',
  },
  {
    id: 'booking',
    kind: 'mock',
    mock: 'booking',
    label: 'Reservas online',
    alt: 'Concepto visual de sistema de reservas con calendario y franjas horarias',
  },
  {
    id: 'automation',
    kind: 'mock',
    mock: 'automation',
    label: 'Automatización',
    alt: 'Concepto visual de flujo de automatización conectando agentes y acciones',
  },
  {
    id: 'custom',
    kind: 'mock',
    mock: 'custom',
    label: 'Web a medida',
    alt: 'Concepto visual de experiencia web personalizada con composición editorial',
  },
];

/**
 * Copias del set de tarjetas. Se renderizan tres para garantizar que nunca
 * queden huecos visibles mientras el desplazamiento se recicla.
 */
const COPIES = 3;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    SamuelResultComponent,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  modalService = inject(ConsultationService);
  samuel = inject(SamuelDiagnosisService);

  @ViewChild('hgViewport') private hgViewport?: ElementRef<HTMLElement>;
  @ViewChild('hgStage') private hgStage?: ElementRef<HTMLElement>;
  @ViewChild('hgRoot') private hgRoot?: ElementRef<HTMLElement>;

  isDiagnosisModalOpen = signal(false);
  /** Estado de arrastre: controla el cursor grab/grabbing. */
  isDragging = signal(false);
  freeText = '';

  /** Celdas del calendario en el mockup de reservas. */
  readonly calCells = Array.from({ length: 21 }, (_, i) => i);
  readonly calActive = [4, 9, 10, 15, 17];

  /** Set de tarjetas a renderizar (originales + clones). */
  readonly loopCards: LoopCard[] = buildLoopCards();

  readonly currentSamuelPrompt = computed(() => {
    const step = this.samuel.currentQuestionStep();
    if (step && step.messages && step.messages.length > 0) {
      return step.messages[step.messages.length - 1];
    }
    return 'Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?';
  });

  private hasInitializedHome = false;

  /* ─── Estado del motor de galería ─── */
  private rafId = 0;
  private lastTs = 0;
  /** Desplazamiento horizontal acumulado, en px. */
  private scroll = 0;
  /** Velocidad instantánea para la inercia, en px/s. */
  private velocity = 0;
  private dragging = false;
  private pointerId = -1;
  private lastPointerX = 0;
  private lastPointerTs = 0;
  private dragStartX = 0;
  private dragMoved = false;
  private inView = false;
  private reducedMotion = false;
  private measured = false;
  /** Contador de fotogramas para espaciar la comprobación de visibilidad. */
  private frameCount = 0;

  /** Timestamp de la última interacción del usuario. */
  private lastInteractionTs = Number.NEGATIVE_INFINITY;
  /** Tiempo de espera en ms antes de reanudar el movimiento automático. */
  private readonly RESUME_DELAY = 3000;
  /** Cada cuántos fotogramas se recalcula la visibilidad real de la galería. */
  private readonly VISIBILITY_EVERY = 20;

  private cardW = 232;
  private spacing = 288;
  private loopWidth = 0;
  private wrapHi = 0;
  private viewportW = 0;
  private maxHalf = 0;
  private autoSpeed = 34;
  private arcY = 34;

  private ro?: ResizeObserver;
  private entryTl?: { kill: () => void };
  private gsapCtx?: { revert: () => void };

  /* ─── Constantes de la geometría curva ─── */
  private readonly MIN_SCALE = 0.8;
  private readonly MAX_SCALE = 1.14;
  private readonly MAX_ROT = 40;
  private readonly FRICTION = 3.4;
  private readonly DRAG_THRESHOLD = 8;
  private readonly MAX_FLING = 3200;

  constructor() {
    effect(() => {
      // Mantiene reactividad sobre el estado del asesor Samuel AI.
      this.samuel.messages();
      this.samuel.isThinking();
      this.samuel.showResult();
    });
  }

  /* ════════════════════════════════════
     Lifecycle
     ════════════════════════════════════ */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.measure();
    this.observe();
    this.refreshInView();
    this.renderFrame();

    if (!this.reducedMotion) {
      this.startLoop();
      void this.runEntry();
    }

    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      this.samuel.startHome();
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopLoop();
    this.ro?.disconnect();
    this.entryTl?.kill();
    this.gsapCtx?.revert();
    this.ro = undefined;
    this.entryTl = undefined;
    this.gsapCtx = undefined;
  }

  /* ════════════════════════════════════
     Medición y observadores
     ════════════════════════════════════ */
  private measure(): void {
    const stage = this.hgStage?.nativeElement;
    const viewport = this.hgViewport?.nativeElement;
    if (!stage || !viewport) return;

    const cs = getComputedStyle(viewport);
    this.cardW = parseFloat(cs.getPropertyValue('--hg-card-w')) || 232;
    this.spacing = this.cardW + (parseFloat(cs.getPropertyValue('--hg-gap')) || 56);
    this.autoSpeed = parseFloat(cs.getPropertyValue('--hg-speed')) || 34;
    this.arcY = parseFloat(cs.getPropertyValue('--hg-arc')) || 34;

    this.viewportW = viewport.clientWidth || window.innerWidth;
    this.maxHalf = (this.cardW * this.MAX_SCALE) / 2;
    this.loopWidth = HERO_CARDS.length * this.spacing;
    // Límite superior del desplazamiento: deja siempre tarjetas cubriendo el borde.
    this.wrapHi = -(this.viewportW / 2 + this.maxHalf);

    if (!this.measured) {
      // Arranque alineado a la retícula para que una tarjeta quede al centro.
      this.scroll = Math.floor(this.wrapHi / this.spacing) * this.spacing;
      this.measured = true;
    }
    this.applyWrap();
  }

  private observe(): void {
    const viewport = this.hgViewport?.nativeElement;
    if (!viewport) return;

    this.ro = new ResizeObserver(() => {
      this.measure();
      this.renderFrame();
    });
    this.ro.observe(viewport);
  }

  /**
   * Visibilidad real de la galería. Se mide desde la geometría en cada
   * comprobación (y no con un observador que puede quedar desincronizado)
   * para que el movimiento automático nunca se quede bloqueado.
   */
  private refreshInView(): void {
    const viewport = this.hgViewport?.nativeElement;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const h = window.innerHeight || 0;
    this.inView = rect.bottom > -120 && rect.top < h + 120;
  }

  /* ════════════════════════════════════
     Bucle de animación (basado en tiempo)
     ════════════════════════════════════ */
  private startLoop(): void {
    if (this.rafId) return;
    this.lastTs = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private readonly tick = (ts: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    // Delta en segundos: el movimiento no depende de la tasa de refresco.
    const dt = this.lastTs ? Math.min((ts - this.lastTs) / 1000, 0.05) : 0;
    this.lastTs = ts;

    // La visibilidad se recalcula desde la geometría cada pocos fotogramas.
    if (++this.frameCount >= this.VISIBILITY_EVERY) {
      this.frameCount = 0;
      this.refreshInView();
    }

    // Fuera de pantalla no hay nada que animar: el bucle sigue vivo pero barato.
    if (!this.dragging && !this.inView) return;

    if (!this.dragging) {
      if (this.velocity !== 0) {
        // Inercia con decaimiento exponencial.
        this.scroll += this.velocity * dt;
        this.velocity *= Math.exp(-this.FRICTION * dt);
        if (Math.abs(this.velocity) < 6) this.velocity = 0;
      } else if (!this.reducedMotion && ts - this.lastInteractionTs > this.RESUME_DELAY) {
        // Desplazamiento automático continuo: derecha → izquierda.
        // Se pausa al interactuar y se reanuda solo tras unos segundos de calma.
        this.scroll -= this.autoSpeed * dt;
      }
    }

    this.applyWrap();
    this.renderFrame();
  };

  /** Recicla el desplazamiento para lograr un loop infinito sin saltos. */
  private applyWrap(): void {
    if (this.loopWidth <= 0) return;
    let d = this.scroll - this.wrapHi;
    d -= Math.floor(d / this.loopWidth) * this.loopWidth; // [0, loopWidth)
    if (d > 0) d -= this.loopWidth; // ( -loopWidth, 0 ]
    this.scroll = this.wrapHi + d;
  }

  /**
   * Distribuye las tarjetas sobre la superficie interior de un cilindro:
   * el centro es la tarjeta protagonista (pequeña y recta) y la distancia
   * normalizada al centro define escala, giro y altura.
   */
  private renderFrame(): void {
    const stage = this.hgStage?.nativeElement;
    if (!stage || this.viewportW <= 0) return;

    const half = this.viewportW / 2;
    const invHalf = 1 / half;
    const cards = stage.children;

    for (let i = 0; i < cards.length; i++) {
      const el = cards[i] as HTMLElement;
      const index = Number(el.dataset['i']);
      if (Number.isNaN(index)) continue;

      const x = index * this.spacing + this.scroll;
      const t = Math.max(-1, Math.min(1, x * invHalf)); // -1 … 1 respecto al centro
      const abs = Math.abs(t);

      const scale = this.MIN_SCALE + (this.MAX_SCALE - this.MIN_SCALE) * Math.pow(abs, 1.5);
      const rotY = -t * this.MAX_ROT;
      const y = -this.arcY * Math.pow(abs, 1.35);

      // `perspective()` por tarjeta: da profundidad real al giro sin depender del
      // contexto 3D del contenedor, y mantiene el z-index en orden normal.
      el.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
        `perspective(${PERSPECTIVE}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.style.zIndex = String(Math.round(100 - abs * 100));
    }
  }

  /* ════════════════════════════════════
     Interacción — mouse y touch
     ════════════════════════════════════ */
  onPointerDown(ev: PointerEvent): void {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;

    const viewport = this.hgViewport?.nativeElement;
    if (!viewport) return;

    this.dragging = true;
    this.isDragging.set(true);
    this.velocity = 0;
    this.pointerId = ev.pointerId;
    this.lastPointerX = ev.clientX;
    this.lastPointerTs = performance.now();
    this.lastInteractionTs = this.lastPointerTs;
    this.dragStartX = ev.clientX;
    this.dragMoved = false;

    try {
      viewport.setPointerCapture(ev.pointerId);
    } catch {
      /* El navegador puede rechazar la captura; el arrastre sigue funcionando. */
    }
    this.startLoop();
  }

  onPointerMove(ev: PointerEvent): void {
    if (!this.dragging || ev.pointerId !== this.pointerId) return;

    const now = performance.now();
    const dt = Math.max(1, now - this.lastPointerTs) / 1000;
    const dx = ev.clientX - this.lastPointerX;

    this.scroll += dx;

    // Velocidad suavizada para que la inercia al soltar sea natural.
    const instant = dx / dt;
    this.velocity = this.velocity * 0.75 + instant * 0.25;

    this.lastPointerX = ev.clientX;
    this.lastPointerTs = now;
    this.lastInteractionTs = now;

    if (Math.abs(ev.clientX - this.dragStartX) > this.DRAG_THRESHOLD) this.dragMoved = true;
  }

  onPointerUp(ev: PointerEvent): void {
    if (!this.dragging) return;

    this.dragging = false;
    this.isDragging.set(false);
    this.pointerId = -1;
    this.lastInteractionTs = performance.now();

    const viewport = this.hgViewport?.nativeElement;
    try {
      viewport?.releasePointerCapture(ev.pointerId);
    } catch {
      /* Captura ya liberada. */
    }

    if (this.reducedMotion || !this.dragMoved) {
      // Toque sin arrastre: no se aplica inercia.
      this.velocity = 0;
    } else {
      this.velocity = Math.max(-this.MAX_FLING, Math.min(this.MAX_FLING, this.velocity));
    }
  }

  /* ════════════════════════════════════
     Animación de entrada (GSAP)
     ════════════════════════════════════ */
  private async runEntry(): Promise<void> {
    const root = this.hgRoot?.nativeElement;
    if (!root) return;

    let gsap: typeof import('gsap').gsap;
    try {
      ({ gsap } = await import('gsap'));
    } catch {
      return; // Sin GSAP el contenido queda visible en su estado natural.
    }

    const pick = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));

    const badge = pick('[data-hg="badge"]');
    const title = pick('[data-hg="title"]');
    const sub = pick('[data-hg="sub"]');
    const actions = pick('[data-hg="actions"] > *');
    const gallery = pick('[data-hg="gallery"]');
    const cards = pick('.hg-card__inner');
    const cta = pick('[data-hg="cta"]');
    const notes = pick('[data-hg="note"]');
    const draws = pick('[data-hg="draw"]');

    this.gsapCtx = gsap.context(() => {
      // Estado inicial oculto (solo si GSAP está disponible).
      gsap.set(badge, { autoAlpha: 0, y: 12 });
      gsap.set(title, { autoAlpha: 0, y: 30 });
      gsap.set(sub, { autoAlpha: 0, y: 18 });
      gsap.set(actions, { autoAlpha: 0, y: 16 });
      gsap.set(gallery, { autoAlpha: 0, y: 56 });
      gsap.set(cards, { autoAlpha: 0, yPercent: 14 });
      gsap.set(cta, { autoAlpha: 0, y: 18 });
      gsap.set(notes, { autoAlpha: 0 });
      gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 });

      const tl = gsap.timeline({ delay: 0.45, defaults: { ease: 'power3.out' } });

      // 1. badge · 2. título · 3. descripción · 4. CTAs
      tl.to(badge, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(title, { autoAlpha: 1, y: 0, duration: 0.75 }, '-=0.28')
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.42')
        .to(actions, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, '-=0.34')
        // 5. galería desde abajo · 6. tarjetas escalonadas
        .to(gallery, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.28')
        .to(
          cards,
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.55,
            stagger: { each: 0.03, from: 'center' },
          },
          '-=0.52',
        )
        .to(cta, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.34')
        // 7. trazos dibujados · 8. anotaciones
        .to(draws, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08, ease: 'power2.inOut' }, '-=0.3')
        .to(notes, { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, '-=0.55');

      this.entryTl = tl;
    }, root);
  }

  /* ════════════════════════════════════
     Acciones
     ════════════════════════════════════ */
  openDiagnosis(): void {
    this.isDiagnosisModalOpen.set(true);
    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      this.samuel.startHome();
    }
  }

  closeDiagnosis(): void {
    this.isDiagnosisModalOpen.set(false);
    this.samuel.close();
  }

  openConsultation(): void {
    this.modalService.open();
  }

  openWhatsAppBooking(): void {
    const text = encodeURIComponent(
      '¡Hola SAMTS! 👋 Me gustaría agendar una llamada para conocer más sobre sus servicios de páginas web y agentes de IA.',
    );
    window.open('https://wa.me/573148180949?text=' + text, '_blank');
  }

  /** CTA inferior: lleva a la sección de servicios existente. */
  onExploreSolutions(): void {
    const target = document.getElementById('services');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onQuickReply(value: string): void {
    this.samuel.submitAnswer(value);
  }

  onSendText(): void {
    const text = this.freeText.trim();
    if (!text) return;
    this.freeText = '';
    this.samuel.submitAnswer(text);
  }

  onWhatsApp(): void {
    this.closeDiagnosis();
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    window.open(`https://wa.me/573148180949?text=${msg}`, '_blank');
  }

  onRequestQuote(): void {
    this.closeDiagnosis();
    this.modalService.open();
  }

  onRestart(): void {
    this.samuel.restart();
  }

  onSelectSolution(plan: any): void {
    this.closeDiagnosis();
    this.samuel.unlockDemo();
  }
}

/** Genera el set repetido de tarjetas que alimenta el loop infinito. */
function buildLoopCards(): LoopCard[] {
  const total = HERO_CARDS.length * COPIES;
  const out: LoopCard[] = [];

  for (let i = 0; i < total; i++) {
    const card = HERO_CARDS[i % HERO_CARDS.length];
    const copy = Math.floor(i / HERO_CARDS.length);

    out.push({
      uid: `${card.id}-${copy}`,
      card,
      src: card.kind === 'image' ? cdnUrl(card.img) : '',
      index: i,
      isClone: copy > 0,
      // La primera copia es la que arranca frente al visitante.
      priority: copy === 0 && i < HERO_CARDS.length,
    });
  }

  return out;
}

import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
interface Project {
  name: string;
  type: string;
  description: string;
  tags: string[];
  video?: string;
  link?: string;
  conceptual: boolean;
  badge?: string;
}

/* ══════════════════════════════════════════════════════════════
   SAMTS — Portafolio horizontal controlado por scroll vertical
   El scroll vertical de la página recorre los proyectos en horizontal
   (GSAP ScrollTrigger con pin + scrub). En pantallas pequeñas o con
   `prefers-reduced-motion` el carrusel pasa a desplazamiento táctil nativo.
   ══════════════════════════════════════════════════════════════ */

/** Breakpoint a partir del cual se activa la experiencia fijada. */
const PIN_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.scss'],
})
export class ProjectsSectionComponent implements OnDestroy {

  @ViewChild('pin') private pinRef?: ElementRef<HTMLElement>;
  @ViewChild('viewport') private viewportRef?: ElementRef<HTMLElement>;
  @ViewChild('track') private trackRef?: ElementRef<HTMLElement>;

  readonly projects: Project[] = [
    {
      name: 'Luxury Store',
      type: 'E-commerce Premium & Panel Administrativo',
      description:
        'Plataforma de comercio electrónico de alta gama diseñada para calzado y moda exclusiva. Integra pasarela de pagos, catálogo dinámico interactivo y un panel de administración completo para gestionar stock, productos, pedidos e inventario en tiempo real.',
      tags: ['Angular', 'Node.js', 'PostgreSQL', 'Express', 'Admin Panel', 'E-commerce'],
      video: '/videos/luxury-store.mp4',
      link: 'https://luxury-store.co',
      conceptual: false,
    },
    {
      name: 'Santuario Café & Restaurante',
      type: 'Portal Gastronómico & Sistema de Reservas',
      description:
        'Sitio web oficial y panel administrativo para un destino gastronómico emblemático de Circasia, Quindío. Permite la visualización y edición en tiempo real del menú digital interactivo, la promoción de eventos y la gestión digital del flujo de clientes.',
      tags: ['Angular', 'Node.js', 'Admin Panel', 'Tailwind CSS', 'Gestión de Menú'],
      video: '/videos/santuario-circasia.mp4',
      link: 'https://santuario-circasia.com',
      conceptual: false,
    },
    {
      name: 'Tu proyecto podría estar aquí.',
      type: 'Proyecto a medida',
      description:
        'Trabajamos contigo para diseñar y desarrollar soluciones web a medida con paneles administrativos autogestionables, integraciones API y alto rendimiento.',
      tags: ['Angular', 'NestJS', 'SAMTS - AI'],
      conceptual: true,
      badge: 'PRÓXIMAMENTE',
    },
  ];

  /** Total de proyectos del recorrido (se muestra en el indicador). */
  readonly total = this.projects.length;

  /** Índice del proyecto más visible. */
  readonly activeIndex = signal(0);

  /** Progreso del recorrido, 0 – 100. */
  readonly progressPct = signal(0);

  /** `true` mientras la sección está fijada (habilita el recorte del viewport). */
  readonly isPinned = signal(false);

  private mm?: { revert: () => void };
  private nativeViewport?: HTMLElement;
  private nativeScroll?: () => void;
  private videoEls: HTMLVideoElement[] = [];
  private destroyed = false;

  constructor() {
    // Solo en el navegador: no se ejecuta durante el renderizado del servidor.
    afterNextRender(() => void this.initHorizontal());
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.teardown();
  }

  /** Rellena a dos dígitos el contador "01 / 03". */
  pad(n: number): string {
    return n < 10 ? '0' + n : String(n);
  }

  /* ════════════════════════════════════
     Montaje
     ════════════════════════════════════ */
  private async initHorizontal(): Promise<void> {
    const pin = this.pinRef?.nativeElement;
    const viewport = this.viewportRef?.nativeElement;
    const track = this.trackRef?.nativeElement;
    if (!pin || !viewport || !track) return;

    this.videoEls = Array.from(track.querySelectorAll<HTMLVideoElement>('video'));
    this.bindNativeScroll(viewport);
    this.syncActive(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let gsap: typeof import('gsap').gsap;
    let ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
    try {
      ({ gsap } = await import('gsap'));
      ({ ScrollTrigger } = await import('gsap/ScrollTrigger'));
    } catch {
      // Sin GSAP la sección queda como carrusel táctil navegable.
      return;
    }
    if (this.destroyed) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add(PIN_QUERY, () => {
      this.isPinned.set(true);

      // Distancia real del recorrido: ancho del contenido menos el del viewport.
      const distance = (): number => Math.max(0, track.scrollWidth - viewport.clientWidth);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => this.applyProgress(self.progress),
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        this.isPinned.set(false);
      };
    });

    // La tipografía web puede cambiar la altura del documento después del montaje:
    // se recalcula cuando el layout se estabiliza para no arrastrar un desfase.
    const refresh = (): void => ScrollTrigger.refresh();
    requestAnimationFrame(() => requestAnimationFrame(refresh));
    document.fonts?.ready.then(refresh).catch(() => undefined);

    if (this.destroyed) {
      mm.revert();
      return;
    }
    this.mm = mm;
  }

  /**
   * Modo táctil: el propio viewport es el contenedor de scroll horizontal,
   * así que el progreso se deriva de su posición de scroll.
   */
  private bindNativeScroll(viewport: HTMLElement): void {
    const handler = (): void => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      this.applyProgress(max > 0 ? viewport.scrollLeft / max : 0);
    };
    viewport.addEventListener('scroll', handler, { passive: true });
    this.nativeViewport = viewport;
    this.nativeScroll = handler;
  }

  /** Convierte el progreso del scroll en indicadores y sincroniza los vídeos. */
  private applyProgress(raw: number): void {
    const progress = Math.min(1, Math.max(0, raw));
    this.progressPct.set(Math.round(progress * 1000) / 10);

    const last = this.projects.length - 1;
    const index = last > 0 ? Math.round(progress * last) : 0;
    if (index !== this.activeIndex()) {
      this.activeIndex.set(index);
      this.syncActive(index);
    }
  }

  /** Reproduce únicamente el vídeo del proyecto activo; el resto se pausa. */
  private syncActive(active: number): void {
    for (const video of this.videoEls) {
      if (Number(video.dataset['pi']) === active) {
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') playing.catch(() => undefined);
      } else if (!video.paused) {
        video.pause();
      }
    }
  }

  private teardown(): void {
    if (this.nativeViewport && this.nativeScroll) {
      this.nativeViewport.removeEventListener('scroll', this.nativeScroll);
    }
    this.mm?.revert();
    this.mm = undefined;
    this.nativeViewport = undefined;
    this.nativeScroll = undefined;
    this.videoEls = [];
  }
}

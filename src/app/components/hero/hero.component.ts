import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { Router } from '@angular/router';
import gsap from 'gsap';

/* ─── Canvas scene definitions ───────────────────────────────────── */
interface LaptopScene {
  label: string;
  color: string;
  accent: string;
  bg: string;
  items: { y: number; w: number; h: number; color: string }[];
}

interface PhoneScene {
  label: string;
  color: string;
  accent: string;
  bg: string;
  hasNav: boolean;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private router = inject(Router);
  modalService = inject(ConsultationService);

  showDemoVideo = signal(false);

  @ViewChild('laptopWrap') laptopWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('phoneWrap') phoneWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('laptopCanvas') laptopCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('phoneCanvas') phoneCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heroMedia') heroMedia!: ElementRef<HTMLDivElement>;
  @ViewChild('heroContent') heroContent!: ElementRef<HTMLDivElement>;
  @ViewChild('heroBadge') heroBadge!: ElementRef<HTMLDivElement>;
  @ViewChild('heroHeading') heroHeading!: ElementRef<HTMLHeadingElement>;
  @ViewChild('heroSubheading') heroSubheading!: ElementRef<HTMLParagraphElement>;
  @ViewChild('heroCtas') heroCtas!: ElementRef<HTMLDivElement>;
  @ViewChild('heroStats') heroStats!: ElementRef<HTMLDivElement>;

  /* Parallax state */
  private mouseX = 0;
  private mouseY = 0;
  private rafId: number | null = null;
  private canvasRafId: number | null = null;

  /* Canvas animation state */
  private laptopSceneIndex = 0;
  private phoneSceneIndex = 0;
  private laptopProgress = 0; // 0-1 within a scene
  private phoneProgress = 0;
  private readonly SCENE_DURATION = 180; // frames per scene
  private laptopFrame = 0;
  private phoneFrame = 0;

  /* Floating animation offsets (driven by sine wave) */
  private floatTick = 0;

  private readonly LAPTOP_SCENES: LaptopScene[] = [
    {
      label: 'E-Commerce',
      color: '#2563eb',
      accent: '#60a5fa',
      bg: '#f0f7ff',
      items: [
        { y: 52, w: 0.45, h: 0.12, color: '#dbeafe' },
        { y: 72, w: 0.30, h: 0.08, color: '#bfdbfe' },
        { y: 86, w: 0.55, h: 0.22, color: '#e0f2fe' },
      ],
    },
    {
      label: 'Landing Page',
      color: '#7c3aed',
      accent: '#a78bfa',
      bg: '#f5f3ff',
      items: [
        { y: 50, w: 0.65, h: 0.10, color: '#ede9fe' },
        { y: 66, w: 0.40, h: 0.06, color: '#ddd6fe' },
        { y: 80, w: 0.80, h: 0.25, color: '#f0fdf4' },
      ],
    },
    {
      label: 'Dashboard',
      color: '#059669',
      accent: '#34d399',
      bg: '#f0fdf4',
      items: [
        { y: 48, w: 0.25, h: 0.16, color: '#dcfce7' },
        { y: 48, w: 0.25, h: 0.16, color: '#bbf7d0' },
        { y: 48, w: 0.25, h: 0.16, color: '#d1fae5' },
        { y: 72, w: 0.75, h: 0.22, color: '#ecfdf5' },
      ],
    },
    {
      label: 'Blog',
      color: '#d97706',
      accent: '#fbbf24',
      bg: '#fffbeb',
      items: [
        { y: 50, w: 0.70, h: 0.08, color: '#fef3c7' },
        { y: 64, w: 0.90, h: 0.05, color: '#fde68a' },
        { y: 74, w: 0.60, h: 0.05, color: '#fde68a' },
        { y: 84, w: 0.85, h: 0.20, color: '#fff7ed' },
      ],
    },
  ];

  private readonly PHONE_SCENES: PhoneScene[] = [
    { label: 'Responsive', color: '#2563eb', accent: '#60a5fa', bg: '#f0f7ff', hasNav: false },
    { label: 'Menú Móvil',  color: '#1e40af', accent: '#3b82f6', bg: '#eff6ff', hasNav: true  },
    { label: 'WhatsApp',   color: '#16a34a', accent: '#4ade80', bg: '#f0fdf4', hasNav: false },
    { label: 'Checkout',   color: '#7c3aed', accent: '#a78bfa', bg: '#f5f3ff', hasNav: false },
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      // Slight delay to let DOM settle
      setTimeout(() => {
        this.runEntryAnimations();
        this.startCanvasLoop();
        this.startParallaxLoop();
      }, 100);
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.canvasRafId) cancelAnimationFrame(this.canvasRafId);
  }

  /* ─── Entry Animations (GSAP) ─────────────────────────────── */
  private runEntryAnimations(): void {
    const ease = 'power3.out';

    // Navbar slides from top (target the nav element directly)
    const nav = document.querySelector('.samts-nav');
    if (nav) {
      gsap.fromTo(nav,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease }
      );
    }

    // Text side: badge → heading → subheading → ctas → stats
    const tl = gsap.timeline({ delay: 0.15 });

    if (this.heroBadge?.nativeElement) {
      tl.fromTo(this.heroBadge.nativeElement,
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease }
      );
    }
    if (this.heroHeading?.nativeElement) {
      tl.fromTo(this.heroHeading.nativeElement,
        { x: -32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease },
        '-=0.35'
      );
    }
    if (this.heroSubheading?.nativeElement) {
      tl.fromTo(this.heroSubheading.nativeElement,
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, ease },
        '-=0.40'
      );
    }
    if (this.heroCtas?.nativeElement) {
      tl.fromTo(this.heroCtas.nativeElement,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease },
        '-=0.30'
      );
    }
    if (this.heroStats?.nativeElement) {
      tl.fromTo(this.heroStats.nativeElement,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease },
        '-=0.25'
      );
    }

    // Devices: laptop from below with slight rotation, phone shortly after
    if (this.laptopWrap?.nativeElement) {
      gsap.fromTo(this.laptopWrap.nativeElement,
        { y: 60, opacity: 0, rotateX: 8 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease, delay: 0.3 }
      );
    }
    if (this.phoneWrap?.nativeElement) {
      gsap.fromTo(this.phoneWrap.nativeElement,
        { y: 48, opacity: 0, rotateX: 6 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.85, ease, delay: 0.5 }
      );
    }
  }

  /* ─── Mouse Parallax ─────────────────────────────────────── */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    // Normalise to [-1, 1]
    this.mouseX = (e.clientX - cx) / cx;
    this.mouseY = (e.clientY - cy) / cy;
  }

  private startParallaxLoop(): void {
    const MAX_DEG = 4;
    const FLOAT_AMPLITUDE = 8; // px
    const FLOAT_SPEED = 0.015;

    const tick = () => {
      this.floatTick += FLOAT_SPEED;

      const floatLaptop = Math.sin(this.floatTick) * FLOAT_AMPLITUDE;
      const floatPhone  = Math.sin(this.floatTick + 1.1) * FLOAT_AMPLITUDE;

      const rotX = -this.mouseY * MAX_DEG;
      const rotY =  this.mouseX * MAX_DEG;

      if (this.laptopWrap?.nativeElement) {
        gsap.to(this.laptopWrap.nativeElement, {
          rotateX: rotX,
          rotateY: rotY,
          y: floatLaptop,
          duration: 0.8,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      }

      if (this.phoneWrap?.nativeElement) {
        gsap.to(this.phoneWrap.nativeElement, {
          rotateX: rotX * 0.7,
          rotateY: rotY * 0.7,
          y: floatPhone,
          duration: 0.9,
          ease: 'power1.out',
          overwrite: 'auto',
        });
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  /* ─── Canvas Animation Loop ──────────────────────────────── */
  private startCanvasLoop(): void {
    const tick = () => {
      this.drawLaptopFrame();
      this.drawPhoneFrame();
      this.canvasRafId = requestAnimationFrame(tick);
    };
    this.canvasRafId = requestAnimationFrame(tick);
  }

  private drawLaptopFrame(): void {
    const canvasEl = this.laptopCanvasRef?.nativeElement;
    if (!canvasEl) return;

    const parent = canvasEl.parentElement;
    if (!parent) return;

    const W = parent.clientWidth  || 300;
    const H = parent.clientHeight || 180;

    if (canvasEl.width !== W || canvasEl.height !== H) {
      canvasEl.width  = W;
      canvasEl.height = H;
    }

    const ctx = canvasEl.getContext('2d')!;
    const scene = this.LAPTOP_SCENES[this.laptopSceneIndex];
    const next  = this.LAPTOP_SCENES[(this.laptopSceneIndex + 1) % this.LAPTOP_SCENES.length];

    // Advance frame
    this.laptopFrame++;
    if (this.laptopFrame >= this.SCENE_DURATION) {
      this.laptopFrame = 0;
      this.laptopSceneIndex = (this.laptopSceneIndex + 1) % this.LAPTOP_SCENES.length;
      return;
    }

    // Transition: last 30 frames fade to next
    const FADE_FRAMES = 30;
    let alpha = 1;
    if (this.laptopFrame > this.SCENE_DURATION - FADE_FRAMES) {
      alpha = 1 - (this.laptopFrame - (this.SCENE_DURATION - FADE_FRAMES)) / FADE_FRAMES;
    }

    ctx.clearRect(0, 0, W, H);

    // Draw current scene
    this.drawLaptopScene(ctx, scene, W, H, alpha);

    // Blend next scene if in transition
    if (alpha < 1) {
      this.drawLaptopScene(ctx, next, W, H, 1 - alpha);
    }
  }

  private drawLaptopScene(
    ctx: CanvasRenderingContext2D,
    scene: LaptopScene,
    W: number,
    H: number,
    alpha: number
  ): void {
    ctx.globalAlpha = alpha;

    // Background
    ctx.fillStyle = scene.bg;
    ctx.fillRect(0, 0, W, H);

    // Top nav bar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H * 0.12);

    // Nav logo dot
    ctx.fillStyle = scene.color;
    ctx.beginPath();
    ctx.arc(W * 0.06, H * 0.06, H * 0.022, 0, Math.PI * 2);
    ctx.fill();

    // Nav links
    const navLinkWidths = [0.08, 0.07, 0.09, 0.06];
    let nx = W * 0.16;
    for (const lw of navLinkWidths) {
      ctx.fillStyle = '#e2e8f0';
      this.roundRect(ctx, nx, H * 0.045, W * lw, H * 0.025, 3);
      ctx.fill();
      nx += W * (lw + 0.03);
    }

    // Nav CTA
    ctx.fillStyle = scene.color;
    this.roundRect(ctx, W * 0.82, H * 0.035, W * 0.12, H * 0.045, 12);
    ctx.fill();

    // Hero area
    ctx.fillStyle = scene.accent + '22';
    this.roundRect(ctx, W * 0.05, H * 0.16, W * 0.42, H * 0.30, 8);
    ctx.fill();

    // Heading lines
    ctx.fillStyle = scene.color;
    this.roundRect(ctx, W * 0.07, H * 0.20, W * 0.30, H * 0.055, 4);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    this.roundRect(ctx, W * 0.07, H * 0.27, W * 0.22, H * 0.035, 3);
    ctx.fill();
    this.roundRect(ctx, W * 0.07, H * 0.32, W * 0.25, H * 0.028, 3);
    ctx.fill();

    // CTA Button in hero
    ctx.fillStyle = scene.color;
    this.roundRect(ctx, W * 0.07, H * 0.375, W * 0.18, H * 0.048, 14);
    ctx.fill();

    // Right image block
    ctx.fillStyle = scene.accent + '33';
    this.roundRect(ctx, W * 0.52, H * 0.14, W * 0.43, H * 0.35, 10);
    ctx.fill();
    // Image placeholder icon
    ctx.fillStyle = scene.accent + '88';
    ctx.beginPath();
    ctx.arc(W * 0.735, H * 0.315, H * 0.055, 0, Math.PI * 2);
    ctx.fill();

    // Scene items (cards/content)
    for (const item of scene.items) {
      ctx.fillStyle = item.color;
      this.roundRect(ctx, W * 0.05, H * (item.y / 100), W * item.w, H * item.h, 6);
      ctx.fill();
    }

    // Label badge
    ctx.fillStyle = scene.color;
    ctx.globalAlpha = alpha * 0.90;
    this.roundRect(ctx, W * 0.73, H * 0.88, W * 0.23, H * 0.09, 10);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, H * 0.055)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(scene.label, W * 0.845, H * 0.945);
    ctx.textAlign = 'left';

    ctx.globalAlpha = 1;
  }

  private drawPhoneFrame(): void {
    const canvasEl = this.phoneCanvasRef?.nativeElement;
    if (!canvasEl) return;

    const parent = canvasEl.parentElement;
    if (!parent) return;

    const W = parent.clientWidth  || 120;
    const H = parent.clientHeight || 230;

    if (canvasEl.width !== W || canvasEl.height !== H) {
      canvasEl.width  = W;
      canvasEl.height = H;
    }

    const ctx = canvasEl.getContext('2d')!;
    const scene = this.PHONE_SCENES[this.phoneSceneIndex];
    const next  = this.PHONE_SCENES[(this.phoneSceneIndex + 1) % this.PHONE_SCENES.length];

    this.phoneFrame++;
    if (this.phoneFrame >= this.SCENE_DURATION) {
      this.phoneFrame = 0;
      this.phoneSceneIndex = (this.phoneSceneIndex + 1) % this.PHONE_SCENES.length;
      return;
    }

    const FADE_FRAMES = 30;
    let alpha = 1;
    if (this.phoneFrame > this.SCENE_DURATION - FADE_FRAMES) {
      alpha = 1 - (this.phoneFrame - (this.SCENE_DURATION - FADE_FRAMES)) / FADE_FRAMES;
    }

    ctx.clearRect(0, 0, W, H);
    this.drawPhoneScene(ctx, scene, W, H, alpha);
    if (alpha < 1) {
      this.drawPhoneScene(ctx, next, W, H, 1 - alpha);
    }
  }

  private drawPhoneScene(
    ctx: CanvasRenderingContext2D,
    scene: PhoneScene,
    W: number,
    H: number,
    alpha: number
  ): void {
    ctx.globalAlpha = alpha;

    // Bg
    ctx.fillStyle = scene.bg;
    ctx.fillRect(0, 0, W, H);

    // Status bar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H * 0.07);

    // Signal dots
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(W * (0.08 + i * 0.055), H * 0.035, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Battery
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(W * 0.80, H * 0.025, W * 0.12, H * 0.022);

    if (scene.hasNav) {
      // Slide-in nav menu
      const slideX = Math.min(1, this.phoneFrame / 30);
      const menuW = W * 0.78;
      const menuX = -menuW + menuW * slideX;

      ctx.fillStyle = scene.color;
      this.roundRect(ctx, menuX, H * 0.07, menuW, H, 0);
      ctx.fill();

      const menuItems = ['Inicio', 'Servicios', 'Portafolio', 'Precios', 'Contacto'];
      menuItems.forEach((item, i) => {
        ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.65)';
        ctx.font = `${Math.max(7, H * 0.05)}px Inter, sans-serif`;
        ctx.fillText(item, menuX + W * 0.08, H * (0.18 + i * 0.10));
      });

      // Hamburger / X icon area
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      this.roundRect(ctx, menuX + menuW * 0.75, H * 0.085, W * 0.16, H * 0.055, 6);
      ctx.fill();
    } else {
      // Top nav bar
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, H * 0.07, W, H * 0.08);

      ctx.fillStyle = scene.color;
      ctx.beginPath();
      ctx.arc(W * 0.12, H * 0.11, H * 0.016, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      this.roundRect(ctx, W * 0.22, H * 0.096, W * 0.30, H * 0.022, 3);
      ctx.fill();

      // Hero block
      ctx.fillStyle = scene.accent + '22';
      this.roundRect(ctx, W * 0.05, H * 0.17, W * 0.90, H * 0.22, 8);
      ctx.fill();

      ctx.fillStyle = scene.color;
      this.roundRect(ctx, W * 0.08, H * 0.20, W * 0.55, H * 0.04, 3);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      this.roundRect(ctx, W * 0.08, H * 0.255, W * 0.45, H * 0.028, 2);
      ctx.fill();
      this.roundRect(ctx, W * 0.08, H * 0.29, W * 0.38, H * 0.028, 2);
      ctx.fill();

      // CTA
      ctx.fillStyle = scene.color;
      this.roundRect(ctx, W * 0.08, H * 0.33, W * 0.38, H * 0.04, 12);
      ctx.fill();

      // Content cards
      const cardColors = [scene.accent + '33', scene.accent + '22', scene.accent + '44'];
      cardColors.forEach((color, i) => {
        ctx.fillStyle = color;
        this.roundRect(ctx, W * 0.05, H * (0.42 + i * 0.155), W * 0.90, H * 0.12, 6);
        ctx.fill();
        ctx.fillStyle = scene.color;
        this.roundRect(ctx, W * 0.10, H * (0.44 + i * 0.155), W * 0.30, H * 0.025, 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        this.roundRect(ctx, W * 0.10, H * (0.475 + i * 0.155), W * 0.50, H * 0.018, 2);
        ctx.fill();
      });

      // Bottom bar
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, H * 0.91, W, H * 0.09);
      ctx.fillStyle = scene.color;
      ['⌂', '☰', '♥', '👤'].forEach((icon, i) => {
        ctx.font = `${H * 0.04}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = i === 0 ? scene.color : '#94a3b8';
        ctx.fillText(icon, W * (0.15 + i * 0.23), H * 0.955);
      });
      ctx.textAlign = 'left';
    }

    // Label
    ctx.fillStyle = scene.color;
    ctx.globalAlpha = alpha * 0.9;
    this.roundRect(ctx, W * 0.05, H * 0.91 - (scene.hasNav ? H * 0.12 : 0), W * 0.90, H * 0.055, 8);
    if (scene.hasNav) {
      this.roundRect(ctx, W * 0.05, H * 0.79, W * 0.90, H * 0.055, 8);
    }
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(7, H * 0.038)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    const labelY = scene.hasNav ? H * 0.825 : H * 0.945;
    ctx.fillText(scene.label, W * 0.50, labelY);
    ctx.textAlign = 'left';

    ctx.globalAlpha = 1;
  }

  /* ─── Utility: rounded rect ──────────────────────────────── */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number
  ): void {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    } else {
      // Fallback for older browsers
      const minR = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + minR, y);
      ctx.arcTo(x + w, y, x + w, y + h, minR);
      ctx.arcTo(x + w, y + h, x, y + h, minR);
      ctx.arcTo(x, y + h, x, y, minR);
      ctx.arcTo(x, y, x + w, y, minR);
      ctx.closePath();
    }
  }

  /* ─── Actions ────────────────────────────────────────────── */
  openConsultation(): void {
    this.modalService.open();
  }

  scrollToServices(): void {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  playDemo(): void {
    this.showDemoVideo.set(true);
  }

  closeDemo(): void {
    this.showDemoVideo.set(false);
  }
}

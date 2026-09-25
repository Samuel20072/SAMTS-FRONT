import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
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
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  modalService = inject(ConsultationService);
  samuel       = inject(SamuelDiagnosisService);

  showDemoVideo = signal(false);
  freeText = '';

  /* ─── Video sequencing (dual-layer crossfade) ─── */
  private readonly HOME_VIDEO    = '/videos/homevideo1.mp4';
  private readonly CELULAR_VIDEO = '/videos/celular.mp4';
  /** How many home-video plays between each celular appearance */
  private readonly CELULAR_EVERY = 2;
  private homePlayCount  = 0;
  private playingCelular = false;

  /** Which video element is currently active/visible ('A' | 'B') */
  readonly activeLayer = signal<'A' | 'B'>('A');

  readonly currentSamuelPrompt = computed(() => {
    const step = this.samuel.currentQuestionStep();
    if (step && step.messages && step.messages.length > 0) {
      return step.messages[step.messages.length - 1];
    }
    return 'Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?';
  });

  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;
  @ViewChild('videoA') videoA?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoB') videoB?: ElementRef<HTMLVideoElement>;

  private hasInitializedHome = false;

  constructor() {
    effect(() => {
      // Track reactive signals to auto-scroll chat
      this.samuel.messages();
      this.samuel.isThinking();
      this.samuel.showResult();
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  /* ════════════════════════════════════
     Lifecycle
     ════════════════════════════════════ */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Start layer A (already has src set in HTML)
    const vidA = this.videoA?.nativeElement;
    if (vidA) {
      vidA.muted = true;
      vidA.defaultMuted = true;
      vidA.play().catch(() => {});
    }

    // Pre-load celular into layer B so first switch is instant
    const vidB = this.videoB?.nativeElement;
    if (vidB) {
      vidB.muted = true;
      vidB.defaultMuted = true;
      vidB.src = this.CELULAR_VIDEO;
      vidB.load();
    }

    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      this.samuel.startHome();
    }
  }

  ngOnDestroy(): void {}

  /* ─── Video cycling ─── */
  onVideoEnded(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.playingCelular) {
      // Celular ended → back to home video
      this.playingCelular = false;
      this.crossfadeTo(this.HOME_VIDEO);
    } else {
      // Home video ended
      this.homePlayCount++;
      if (this.homePlayCount >= this.CELULAR_EVERY) {
        this.homePlayCount = 0;
        this.playingCelular = true;
        this.crossfadeTo(this.CELULAR_VIDEO);
      } else {
        this.crossfadeTo(this.HOME_VIDEO);
      }
    }
  }

  /**
   * Loads `nextSrc` into the *inactive* layer, plays it, then
   * swaps the active-layer signal so CSS opacity does the crossfade.
   * No white flash because the incoming video is decoded before visible.
   */
  private crossfadeTo(nextSrc: string): void {
    const current   = this.activeLayer();
    const nextLayer = current === 'A' ? 'B' : 'A';
    const nextVid   = (nextLayer === 'A' ? this.videoA : this.videoB)?.nativeElement;
    const currentVid = (current === 'A' ? this.videoA : this.videoB)?.nativeElement;

    if (!nextVid) return;

    nextVid.src = nextSrc;
    nextVid.load();

    const doSwap = () => {
      nextVid.play().catch(() => {});
      this.activeLayer.set(nextLayer);

      // Pause & reset the old layer so it doesn't waste CPU
      if (currentVid) {
        currentVid.pause();
        currentVid.currentTime = 0;
        // Pre-load what will be needed AFTER nextSrc finishes
        this.preloadInactive(currentVid, nextSrc);
      }
    };

    if (nextVid.readyState >= 3 /* HAVE_FUTURE_DATA */) {
      doSwap();
    } else {
      nextVid.addEventListener('canplay', doSwap, { once: true });
    }
  }

  /**
   * While the active video plays, silently pre-load the one
   * that will come AFTER it into the now-idle layer element.
   */
  private preloadInactive(idleVid: HTMLVideoElement, justStartedSrc: string): void {
    const comingNext = justStartedSrc === this.HOME_VIDEO
      ? (this.homePlayCount + 1 >= this.CELULAR_EVERY ? this.CELULAR_VIDEO : this.HOME_VIDEO)
      : this.HOME_VIDEO;

    idleVid.src = comingNext;
    idleVid.load();
  }

  /* ─── Actions ─── */
  openConsultation(): void { this.modalService.open(); }
  playDemo(): void { this.showDemoVideo.set(true); }
  closeDemo(): void { this.showDemoVideo.set(false); }

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
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    const phone = '573000000000'; // Configurable WhatsApp
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  onRequestQuote(): void {
    this.modalService.open();
  }

  onRestart(): void {
    this.samuel.restart();
  }

  onSelectSolution(plan: any): void {
    this.onRequestQuote();
  }

  private scrollToBottom(): void {
    if (this.messagesEl?.nativeElement) {
      const el = this.messagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}


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
  isDiagnosisModalOpen = signal(false);
  freeText = '';

  readonly currentSamuelPrompt = computed(() => {
    const step = this.samuel.currentQuestionStep();
    if (step && step.messages && step.messages.length > 0) {
      return step.messages[step.messages.length - 1];
    }
    return 'Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?';
  });

  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  private hasInitializedHome = false;

  constructor() {
    effect(() => {
      // Track reactive signals to ensure state changes are reactive
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

    // Ensure hero video plays continuously in loop and muted
    const vid = this.heroVideo?.nativeElement;
    if (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.play().catch(() => {});
    }

    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      this.samuel.startHome();
    }
  }

  ngOnDestroy(): void {}

  /* ─── Diagnosis & Modal Actions ─── */
  openDiagnosis(): void {
    this.isDiagnosisModalOpen.set(true);
    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      this.samuel.startHome();
    }
  }

  closeDiagnosis(): void {
    this.isDiagnosisModalOpen.set(false);
  }

  onScrollDown(): void {
    this.samuel.unlockDemo();
    const demoEl = document.getElementById('demo-section');
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openConsultation(): void {
    this.modalService.open();
  }

  playDemo(): void {
    this.showDemoVideo.set(true);
  }

  closeDemo(): void {
    this.showDemoVideo.set(false);
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
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    const phone = '573000000000'; // Configurable WhatsApp
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
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

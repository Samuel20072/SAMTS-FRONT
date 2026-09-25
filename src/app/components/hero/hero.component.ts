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
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  modalService = inject(ConsultationService);
  samuel       = inject(SamuelDiagnosisService);

  showDemoVideo = signal(false);
  freeText = '';

  readonly currentSamuelPrompt = computed(() => {
    const step = this.samuel.currentQuestionStep();
    if (step && step.messages && step.messages.length > 0) {
      return step.messages[step.messages.length - 1];
    }
    return 'Cuéntame, ¿qué te gustaría mejorar o construir para tu negocio?';
  });

  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  private hasInitializedHome = false;

  constructor() {
    effect(() => {
      // Track reactive signals to auto-scroll chat
      this.samuel.messages();
      this.samuel.isThinking();
      this.samuel.showResult();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  /* ════════════════════════════════════
     Lifecycle
     ════════════════════════════════════ */
  ngAfterViewInit(): void {
    if (this.heroVideo?.nativeElement) {
      const vid = this.heroVideo.nativeElement;
      vid.muted = true;
      vid.defaultMuted = true;
      vid.play().catch(() => {});
    }

    // Auto-start Samuel AI conversation directly on page load (only once)
    if (!this.hasInitializedHome) {
      this.hasInitializedHome = true;
      setTimeout(() => {
        this.samuel.startHome();
      }, 400);
    }
  }

  ngOnDestroy(): void {}

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

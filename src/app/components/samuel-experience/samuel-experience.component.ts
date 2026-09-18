import {
  Component,
  inject,
  computed,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { ConsultationService } from '../../services/consultation.service';
import { SamuelResultComponent } from '../samuel-result/samuel-result.component';
import { SolutionPlan, SamuelAnimState } from '../../core/models/samuel.models';
import { QUESTION_STEPS } from '../../core/data/samuel-questions';

const STATE_LABELS: Record<SamuelAnimState, string> = {
  idle:          'En espera',
  greeting:      'Saludando',
  thinking:      'Procesando...',
  explaining:    'Escuchando',
  recommending:  'Recomendando',
};

@Component({
  selector: 'app-samuel-experience',
  standalone: true,
  imports: [CommonModule, FormsModule, SamuelResultComponent],
  templateUrl: './samuel-experience.component.html',
})
export class SamuelExperienceComponent implements AfterViewChecked {
  readonly samuel = inject(SamuelDiagnosisService);
  private modalService = inject(ConsultationService);

  freeText = '';

  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLElement>;
  @ViewChild('panelRef') panelRef?: ElementRef<HTMLElement>;

  /** Human-readable state label for Samuel's current animation state */
  readonly stateLabel = computed(() => STATE_LABELS[this.samuel.samuelAnimState()]);

  /** Step dot array for the progress indicator */
  readonly stepDots = computed(() => Array(QUESTION_STEPS.length).fill(0));

  // Auto-scroll to bottom when messages change
  private prevMsgCount = 0;

  constructor() {
    // Lock body scroll when overlay is open
    effect(() => {
      if (this.samuel.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngAfterViewChecked(): void {
    const msgs = this.samuel.messages();
    if (msgs.length !== this.prevMsgCount) {
      this.prevMsgCount = msgs.length;
      this._scrollMessages();
    }
  }

  // ─── Event handlers ──────────────────────────────────────────

  onQuickReply(value: string): void {
    this.samuel.submitAnswer(value);
  }

  onSendText(): void {
    const text = this.freeText.trim();
    if (!text) return;
    this.freeText = '';
    this.samuel.submitAnswer(text);
  }

  onBackdropClick(event: MouseEvent): void {
    const panel = this.panelRef?.nativeElement;
    if (panel && !panel.contains(event.target as Node)) {
      this.samuel.close();
    }
  }

  onSelectSolution(plan: SolutionPlan): void {
    this.onWhatsApp();
  }

  onRequestQuote(): void {
    this.samuel.close();
    this.modalService.open();
  }

  onWhatsApp(): void {
    const msg = encodeURIComponent(this.samuel.buildWhatsAppMessage());
    // Replace with actual SAMTS WhatsApp number
    const phone = '573000000000';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  // ─── Private ─────────────────────────────────────────────────

  private _scrollMessages(): void {
    setTimeout(() => {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}

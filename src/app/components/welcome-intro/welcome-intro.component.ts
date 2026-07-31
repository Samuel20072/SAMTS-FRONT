import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  PLATFORM_ID,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-welcome-intro',
  standalone: true,
  templateUrl: './welcome-intro.component.html',
  styleUrl: './welcome-intro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeIntroComponent implements OnInit, OnDestroy {
  @Output() introFinished = new EventEmitter<void>();

  private platformId = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────────────────
  phase = signal<0 | 1 | 2 | 3 | 4>(0); // 0=hidden, 1–4=active phases, 0=exit
  isExiting = signal(false);
  progressPercent = signal(0);

  // Typewriter
  fullText = 'Bienvenido.\nTu negocio merece una presencia digital que trabaje por ti.';
  displayedText = signal('');
  private typewriterDone = signal(false);

  // ── Timers ─────────────────────────────────────────────────────────
  private timers: ReturnType<typeof setTimeout>[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private readonly TOTAL_DURATION_MS = 15000;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.startSequence();
  }

  ngOnDestroy(): void {
    this.clearAll();
  }

  // ── Public ─────────────────────────────────────────────────────────
  skip(): void {
    this.exitIntro();
  }

  // ── Private ────────────────────────────────────────────────────────
  private startSequence(): void {
    // Phase 1: Typewriter welcome (0–3s)
    this.phase.set(1);
    this.startTypewriter();
    this.startProgress();

    // Phase 2: Dashboard showcase (3–8s)
    this.timers.push(setTimeout(() => this.phase.set(2), 3000));

    // Phase 3: Value proposition cards (8–12s)
    this.timers.push(setTimeout(() => this.phase.set(3), 8000));

    // Phase 4: CTA (12–15s)
    this.timers.push(setTimeout(() => this.phase.set(4), 12000));

    // Auto-finish (15s)
    this.timers.push(setTimeout(() => this.exitIntro(), 15000));
  }

  private startTypewriter(): void {
    const chars = this.fullText.split('');
    let i = 0;
    const speed = 40; // ms per char
    const interval = setInterval(() => {
      if (i < chars.length) {
        this.displayedText.update(t => t + chars[i]);
        i++;
      } else {
        clearInterval(interval);
        this.typewriterDone.set(true);
      }
    }, speed);
    this.intervals.push(interval);
  }

  private startProgress(): void {
    const step = 100 / (this.TOTAL_DURATION_MS / 100);
    const interval = setInterval(() => {
      this.progressPercent.update(v => {
        const next = v + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 100);
    this.intervals.push(interval);
  }

  private exitIntro(): void {
    this.clearAll();
    this.isExiting.set(true);
    setTimeout(() => {
      this.introFinished.emit();
    }, 800);
  }

  private clearAll(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.intervals.forEach(i => clearInterval(i));
    this.timers = [];
    this.intervals = [];
  }
}

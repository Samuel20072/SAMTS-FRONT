import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LeadMagnetApiService, CampaignStats } from '../../services/api/lead-magnet-api.service';

@Component({
  selector: 'app-sticky-campaign-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible()) {
      <aside class="sticky-cta-wrap" aria-label="Promoción lanzamiento catálogo">
        <div class="sticky-cta-card" (click)="scrollToCatalog()" role="button" tabindex="0" (keydown.enter)="scrollToCatalog()">
          <!-- Glow accent -->
          <div class="sticky-cta-glow" aria-hidden="true"></div>

          <div class="sticky-cta-header">
            <div class="cta-badge">
              <span class="pulse-dot" aria-hidden="true"></span>
              <span>LANZAMIENTO EXCLUSIVO</span>
            </div>
            <button
              type="button"
              class="close-btn"
              (click)="close($event)"
              aria-label="Cerrar notificación"
              title="Cerrar">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="cta-body">
            <h4 class="cta-title">
              ¡20 días <span class="cta-highlight">GRATIS</span> para tu Catálogo!
            </h4>
            <p class="cta-desc">
              Digitaliza tus productos y vende directo por WhatsApp con un solo enlace.
            </p>
          </div>

          <div class="cta-footer">
            <div class="cta-status">
              @if (stats() && stats()!.remaining > 0) {
                <span class="cta-slots">
                  <i class="pi pi-bolt"></i>
                  Quedan <strong>{{ stats()!.remaining }} de {{ stats()!.maxSlots }}</strong> cupos
                </span>
              } @else {
                <span class="cta-slots">
                  <i class="pi pi-sparkles"></i>
                  Cupos gratuitos limitados
                </span>
              }
            </div>

            <button type="button" class="cta-action-btn" (click)="scrollToCatalog()">
              <span>Reclamar</span>
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </div>
      </aside>
    }
  `,
  styles: [`
    .sticky-cta-wrap {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 999;
      animation: ctaSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 320px;
      width: calc(100vw - 2.5rem);
    }

    @keyframes ctaSlideUp {
      from {
        transform: translateY(80px) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .sticky-cta-card {
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border: 1.5px solid rgba(49, 94, 251, 0.25);
      border-radius: 22px;
      padding: 1.25rem;
      box-shadow:
        0 20px 45px -12px rgba(17, 19, 24, 0.18),
        0 10px 25px -8px rgba(49, 94, 251, 0.2);
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      &:hover {
        transform: translateY(-5px);
        border-color: #315efb;
        box-shadow:
          0 26px 50px -10px rgba(17, 19, 24, 0.22),
          0 14px 30px -8px rgba(49, 94, 251, 0.3);

        .cta-action-btn {
          background: #2148d6;
          transform: translateX(2px);
          i { transform: translateX(3px); }
        }
      }
    }

    .sticky-cta-glow {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(49, 94, 251, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .sticky-cta-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #edf2ff;
      color: #315efb;
      font-size: 0.68rem;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid rgba(49, 94, 251, 0.2);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #315efb;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: #315efb;
        opacity: 0.4;
        animation: pulseDot 2s infinite;
      }
    }

    @keyframes pulseDot {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(3); opacity: 0; }
    }

    .close-btn {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: #f1f5f9;
      border: none;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
        transform: rotate(90deg);
      }
    }

    .cta-title {
      font-family: var(--font-display, inherit);
      font-size: 1.05rem;
      font-weight: 850;
      line-height: 1.25;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .cta-highlight {
      background: linear-gradient(135deg, #315efb, #2148d6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 900;
    }

    .cta-desc {
      font-size: 0.8rem;
      line-height: 1.45;
      color: #475569;
      margin: 0.25rem 0 0;
    }

    .cta-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .cta-status {
      flex: 1;
      min-width: 0;
    }

    .cta-slots {
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.35rem;

      i {
        font-size: 0.75rem;
        color: #315efb;
      }

      strong {
        color: #0f172a;
      }
    }

    .cta-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #315efb;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 0.45rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px -3px rgba(49, 94, 251, 0.5);
      transition: all 0.25s ease;
      white-space: nowrap;

      i {
        font-size: 0.7rem;
        transition: transform 0.25s ease;
      }
    }

    @media (max-width: 640px) {
      .sticky-cta-wrap {
        bottom: 1.25rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
        width: auto;
      }
      .sticky-cta-card {
        padding: 1rem;
      }
    }
  `]
})
export class StickyCampaignCtaComponent implements OnInit {
  private leadApi = inject(LeadMagnetApiService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isVisible = signal(true);
  stats = signal<CampaignStats | null>(null);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        if (sessionStorage.getItem('samts_catalog_cta_dismissed') === '1') {
          this.isVisible.set(false);
          return;
        }
      } catch {}

      this.loadStats();
    }
  }

  loadStats() {
    this.leadApi.getCampaignStats('lanzamiento_20_dias').subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: () => {
        // Fallback default retains card visibility
      }
    });
  }

  scrollToCatalog() {
    if (this.router.url !== '/' && !this.router.url.startsWith('/#') && !this.router.url.startsWith('/?')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById('samts-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      });
    } else {
      const el = document.getElementById('samts-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  close(event: MouseEvent) {
    event.stopPropagation();
    this.isVisible.set(false);
    try {
      sessionStorage.setItem('samts_catalog_cta_dismissed', '1');
    } catch {}
  }
}

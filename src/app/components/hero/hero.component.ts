import { Component, inject, signal, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './hero.component.html'
})
export class HeroComponent implements AfterViewInit {
  modalService = inject(ConsultationService);
  showDemoVideo = signal(false);
  scrollY = signal(0);

  // Stats signals for animation
  stat1 = signal(0);
  stat2 = signal(0);
  stat3 = signal(60); // Start at 60 and count down to 0, representing reduction of manual time
  animated = false;

  @ViewChild('statsGrid') statsGrid!: ElementRef;

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated) {
            this.animated = true;
            this.animateStats();
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      if (this.statsGrid) {
        observer.observe(this.statsGrid.nativeElement);
      }
    } else {
      // Fallback for SSR or older browsers
      this.stat1.set(200);
      this.stat2.set(24);
      this.stat3.set(0);
    }
  }

  animateStats() {
    this.animateValue(0, 200, 2000, (val) => this.stat1.set(val));
    this.animateValue(0, 24, 2000, (val) => this.stat2.set(val));
    this.animateValue(60, 0, 2000, (val) => this.stat3.set(val));
  }

  animateValue(start: number, end: number, duration: number, callback: (val: number) => void) {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing: easeOutQuad
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * (end - start) + start);
      callback(currentValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  openConsultation() {
    this.modalService.open();
  }

  playDemo() {
    this.showDemoVideo.set(true);
  }

  closeDemo() {
    this.showDemoVideo.set(false);
  }
}


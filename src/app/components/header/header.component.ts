import { Component, inject, signal, HostListener, ElementRef, OnInit, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  modalService = inject(ConsultationService);
  themeService = inject(ThemeService);
  router = inject(Router);
  private elRef = inject(ElementRef);
  isMenuOpen = signal(false);
  isScrolled = signal(false);
  isDemoActive = signal(false);
  isHoveredTop = signal(false);

  isHeaderHidden = computed(() => {
    return this.isDemoActive() && !this.isHoveredTop() && !this.isMenuOpen();
  });

  isDark = this.themeService.isDark;

  constructor() {
    afterNextRender(() => {
      this.checkDemoSectionVisibility();
    });
  }

  ngOnInit(): void {
    this.checkDemoSectionVisibility();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
    this.checkDemoSectionVisibility();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (event.clientY <= 70) {
      this.isHoveredTop.set(true);
    } else if (event.clientY > 100) {
      this.isHoveredTop.set(false);
    }
  }

  @HostListener('window:touchstart', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      if (touch.clientY <= 70) {
        this.isHoveredTop.set(true);
      } else if (touch.clientY > 120) {
        this.isHoveredTop.set(false);
      }
    }
  }

  private checkDemoSectionVisibility(): void {
    const demoElem = document.getElementById('demo-section');
    if (!demoElem) {
      this.isDemoActive.set(false);
      return;
    }
    const rect = demoElem.getBoundingClientRect();
    // Header should hide when top of demo section has scrolled up past the header area (rect.top <= 80)
    // and demo section bottom is still visible in viewport (rect.bottom >= 120)
    const isActive = rect.top <= 80 && rect.bottom >= 120;
    this.isDemoActive.set(isActive);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  scrollToSection(id: string) {
    this.isMenuOpen.set(false);
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scroll(id), 100);
      });
    } else {
      this.scroll(id);
    }
  }

  private scroll(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateTo(path: string) {
    this.isMenuOpen.set(false);
    this.router.navigate([path]);
  }

  openConsultation() {
    this.modalService.open();
  }
}


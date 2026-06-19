import { Component, inject, signal } from '@angular/core';
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
export class HeaderComponent {
  modalService = inject(ConsultationService);
  themeService = inject(ThemeService);
  router = inject(Router);
  isMenuOpen = signal(false);

  isDark = this.themeService.isDark;

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  scrollToSection(id: string) {
    this.isMenuOpen.set(false);
    // If not on home page, first navigate to home then scroll (ideal implementation)
    // For now we assume they are on home or we navigate to /
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

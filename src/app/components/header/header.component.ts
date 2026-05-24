import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  modalService = inject(ConsultationService);
  router = inject(Router);
  isMenuOpen = signal(false);

  // Simple state for dark mode
  isDark = signal(true); // default dark as per design

  toggleDarkMode() {
    this.isDark.set(!this.isDark());
    const html = document.documentElement;
    if (this.isDark()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
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

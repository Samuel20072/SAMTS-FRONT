import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  modalService = inject(ConsultationService);
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
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openConsultation() {
    this.modalService.open();
  }
}

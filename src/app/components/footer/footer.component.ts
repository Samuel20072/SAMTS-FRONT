import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  modalService = inject(ConsultationService);
  router = inject(Router);

  services = [
    { name: 'Páginas Web', link: 'services' },
    { name: 'IA Automática', link: 'features' },
    { name: 'Tiendas Online', link: 'services' },
    { name: 'Landing Pages', link: 'services' }
  ];

  company = [
    { name: 'Nosotros', link: 'footer' },
    { name: 'Portafolio', link: '/portfolio', isRoute: true },
    { name: 'Blog', link: '/blog', isRoute: true },
    { name: 'Contacto', link: 'footer' }
  ];

  legal = [
    { name: 'Términos', link: '#' },
    { name: 'Privacidad', link: '#' },
    { name: 'Cookies', link: '#' },
    { name: 'Soporte', link: '#' },
    { name: 'hello@samts.co', link: 'mailto:hello@samts.co' }
  ];

  currentYear = new Date().getFullYear();

  scrollToSection(id: string, isRoute?: boolean) {
    if (id === '#') return;
    if (isRoute) {
      this.router.navigate([id]);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openConsultation() {
    this.modalService.open();
  }
}

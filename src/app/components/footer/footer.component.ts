import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  modalService = inject(ConsultationService);

  services = [
    { name: 'Páginas Web', link: 'services' },
    { name: 'IA Automática', link: 'features' },
    { name: 'Tiendas Online', link: 'services' },
    { name: 'Landing Pages', link: 'services' }
  ];

  company = [
    { name: 'Nosotros', link: 'footer' },
    { name: 'Portafolio', link: 'partners' },
    { name: 'Blog', link: 'hero' },
    { name: 'Contacto', link: 'footer' }
  ];

  legal = [
    { name: 'Términos', link: '#' },
    { name: 'Privacidad', link: '#' },
    { name: 'Cookies', link: '#' }
  ];

  currentYear = new Date().getFullYear();

  scrollToSection(id: string) {
    if (id === '#') return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openConsultation() {
    this.modalService.open();
  }
}

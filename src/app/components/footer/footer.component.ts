import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './footer.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .samts-footer {
      background-color: #030712;
      border-top: 1px solid #1E293B;
      padding: 5rem 0 2.5rem 0;
      color: #94A3B8;
      font-family: var(--font-body, sans-serif);
      position: relative;
      overflow: hidden;
    }
    .samts-footer-logo {
      font-family: var(--font-display, monospace);
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      letter-spacing: -0.02em;
      transition: transform 0.2s ease;
      &:hover {
        transform: scale(1.03);
      }
    }
    .samts-footer-logo-img {
      width: 32px;
      height: 32px;
      border-radius: 7px;
      object-fit: contain;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }
    .samts-footer-bracket {
      color: #3B82F6;
    }
    .samts-footer-heading {
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #FFFFFF !important;
      font-family: var(--font-display, sans-serif) !important;
      margin: 0;
    }
    .samts-footer-btn-link {
      color: #94A3B8;
      background: none;
      border: none;
      font-size: 0.88rem;
      padding: 0;
      cursor: pointer;
      text-align: left;
      transition: color 0.2s ease;
      font-family: var(--font-body, sans-serif);
    }
    .samts-footer-btn-link:hover {
      color: #38BDF8;
    }
    .samts-footer-social-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #1E293B;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94A3B8;
      background: #0B1020;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .samts-footer-social-btn:hover {
      border-color: #3B82F6;
      color: #38BDF8;
      background: rgba(37, 99, 235, 0.15);
      transform: translateY(-2px);
    }
  `]
})
export class FooterComponent {
  modalService = inject(ConsultationService);
  router = inject(Router);

  services = [
    { name: 'Páginas Web Profesionales', link: '/pricing', isRoute: true },
    { name: 'Tiendas Virtuales', link: '/pricing', isRoute: true },
    { name: 'Sistemas de Gestión', link: '/pricing', isRoute: true },
    { name: 'Automatizaciones & IA', link: '/pricing', isRoute: true }
  ];

  company = [
    { name: 'Sobre Nosotros', link: '/about', isRoute: true },
    { name: 'Portafolio', link: '/portfolio', isRoute: true },
    { name: 'Precios y Soluciones', link: '/pricing', isRoute: true },
    { name: 'Blog', link: '/blog', isRoute: true },
    { name: 'Guía Gratuita (PDF)', link: '/guia', isRoute: true },
    { name: 'Contacto Directo', link: '/contacto', isRoute: true }
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

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultationService } from '../../services/consultation.service';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';
import { CdnPipe } from '../../core/cdn';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective, CdnPipe],
  templateUrl: './footer.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .samts-footer {
      background-color: var(--color-surface);
      border-top: 1px solid var(--color-line);
      padding: 5rem 0 2.5rem 0;
      color: var(--color-ink-2);
      font-family: var(--font-body, sans-serif);
      position: relative;
      overflow: hidden;
    }
    .samts-footer-logo {
      font-family: var(--font-display, monospace);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-ink);
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
      box-shadow: 0 2px 10px rgba(17, 19, 24, 0.08);
    }
    .samts-footer-bracket {
      color: var(--color-accent);
    }
    .samts-footer-heading {
      font-size: 0.75rem;
      font-weight: 750;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-ink) !important;
      font-family: var(--font-display, sans-serif) !important;
      margin: 0;
    }
    .samts-footer-btn-link {
      color: var(--color-ink-2);
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
      color: var(--color-accent);
    }
    .samts-footer-social-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--color-line);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-ink-2);
      background: var(--color-surface);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .samts-footer-social-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: var(--color-accent-soft);
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
    { name: 'Términos', link: '/terminos', isRoute: true },
    { name: 'Privacidad', link: '/privacy', isRoute: true },
    { name: 'Cookies', link: '/privacy', isRoute: true },
    { name: 'Soporte Directo', link: 'https://wa.me/573148180949', isExternal: true },
    { name: 'hello@samts.co', link: 'mailto:hello@samts.co', isExternal: true }
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

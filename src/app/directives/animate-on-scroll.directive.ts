import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[samtsAnimate]',
  standalone: true,
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  /**
   * Animation variant:
   * 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' |
   * 'fade-in' | 'fade-scale' | 'fade-scale-up'
   */
  @Input('samtsAnimate') animClass: string = 'fade-up';
  /** CSS transition-delay al aparecer, e.g. '100ms', '200ms' */
  @Input() animDelay: string = '0ms';
  /** IntersectionObserver threshold (0–1) */
  @Input() animThreshold: number = 0.08;
  /**
   * Si es true (por defecto), los elementos aparecen al entrar en vista
   * y desaparecen suavemente al salir, re-animándose en cada scroll hacia arriba o abajo.
   */
  @Input() animRepeat: boolean = true;

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el: HTMLElement = this.el.nativeElement;
    const resolvedClass = this.animClass || 'fade-up';

    // Establecer variable para retardo escalonado
    el.style.setProperty('--anim-delay', this.animDelay);
    el.classList.add('samts-anim', resolvedClass);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (!this.animRepeat) {
              this.observer?.unobserve(entry.target);
            }
          } else if (this.animRepeat) {
            // Desaparecer cuando sale de la pantalla
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: this.animThreshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

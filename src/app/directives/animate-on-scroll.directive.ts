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
  /** Animation variant: 'fade-up' | 'fade-left' | 'fade-right' | 'fade-in' | 'fade-scale' */
  @Input('samtsAnimate') animClass: string = 'fade-up';
  /** CSS delay, e.g. '100ms', '200ms' */
  @Input() animDelay: string = '0ms';
  /** IntersectionObserver threshold (0–1) */
  @Input() animThreshold: number = 0.12;

  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el: HTMLElement = this.el.nativeElement;
    el.style.setProperty('--anim-delay', this.animDelay);
    el.classList.add('samts-anim', this.animClass);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.animThreshold }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

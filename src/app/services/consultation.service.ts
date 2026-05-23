import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private isOpenSignal = signal(false);

  readonly isOpen = this.isOpenSignal.asReadonly();

  open() {
    this.isOpenSignal.set(true);
  }

  close() {
    this.isOpenSignal.set(false);
  }
}

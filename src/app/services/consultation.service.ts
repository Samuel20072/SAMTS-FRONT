import { Injectable, signal } from '@angular/core';

export interface ConsultationContext {
  solutionInterest?: string;
  businessName?: string;
  businessType?: string;
  notes?: string;
  diagnosticSessionId?: string;
  budget?: string;
  urgency?: string;
  mainProblem?: string;
  source?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  private isOpenSignal = signal(false);
  private contextSignal = signal<ConsultationContext | null>(null);

  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly context = this.contextSignal.asReadonly();

  open(context?: ConsultationContext) {
    if (context) {
      this.contextSignal.set(context);
    } else {
      this.contextSignal.set(null);
    }
    this.isOpenSignal.set(true);
  }

  close() {
    this.isOpenSignal.set(false);
  }

  clearContext() {
    this.contextSignal.set(null);
  }
}

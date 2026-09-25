import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationResult, SolutionPlan } from '../../core/models/samuel.models';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';

@Component({
  selector: 'app-samuel-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './samuel-result.component.html',
})
export class SamuelResultComponent {
  samuel = inject(SamuelDiagnosisService);

  @Input({ required: true }) recommendation!: RecommendationResult;
  @Input() businessType = '';

  @Output() selectSolution = new EventEmitter<SolutionPlan>();
  @Output() requestQuote   = new EventEmitter<void>();
  @Output() whatsappContact = new EventEmitter<void>();
  @Output() restart        = new EventEmitter<void>();

  openPreview(): void {
    this.samuel.unlockDemo();
  }

  onSelectSolution(plan: SolutionPlan): void {
    this.selectSolution.emit(plan);
  }

  onRequestQuote(): void {
    this.requestQuote.emit();
  }

  onWhatsApp(): void {
    this.whatsappContact.emit();
  }

  onRestart(): void {
    this.restart.emit();
  }
}

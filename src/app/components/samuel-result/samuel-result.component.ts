import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationResult, SolutionPlan } from '../../core/models/samuel.models';

@Component({
  selector: 'app-samuel-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './samuel-result.component.html',
})
export class SamuelResultComponent {
  @Input({ required: true }) recommendation!: RecommendationResult;

  @Output() selectSolution = new EventEmitter<SolutionPlan>();
  @Output() requestQuote   = new EventEmitter<void>();
  @Output() whatsappContact = new EventEmitter<void>();
  @Output() restart        = new EventEmitter<void>();

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

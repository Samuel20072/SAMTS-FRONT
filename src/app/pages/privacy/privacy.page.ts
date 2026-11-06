import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { AnimateOnScrollDirective } from '../../directives/animate-on-scroll.directive';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ConsultationModalComponent, AnimateOnScrollDirective],
  templateUrl: './privacy.page.html'
})
export class PrivacyPage {
  lastUpdated = 'Noviembre 2026';
}

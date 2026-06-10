import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { AiAssistantComponent } from '../../components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    ServicesComponent,
    FeaturesComponent,
    CtaComponent,
    FooterComponent,
    ConsultationModalComponent,
    AiAssistantComponent
  ],
  templateUrl: './home.page.html'
})
export class HomePage {}

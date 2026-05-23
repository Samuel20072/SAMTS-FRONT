import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { PartnersComponent } from '../../components/partners/partners.component';
import { ServicesComponent } from '../../components/services/services.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    PartnersComponent,
    ServicesComponent,
    FeaturesComponent,
    CtaComponent,
    FooterComponent,
    ConsultationModalComponent
  ],
  templateUrl: './home.page.html'
})
export class HomePage {}

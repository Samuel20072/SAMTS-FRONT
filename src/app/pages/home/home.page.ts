import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    ConsultationModalComponent,
  ],
  templateUrl: './home.page.html'
})
export class HomePage {}

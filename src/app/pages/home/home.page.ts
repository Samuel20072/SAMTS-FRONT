import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { BusinessDemoSectionComponent } from '../../components/business-demo-section/business-demo-section.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { DemoEditorComponent } from '../../components/demo-editor/demo-editor.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { HowWeWorkComponent } from '../../components/how-we-work/how-we-work.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    BusinessDemoSectionComponent,
    FooterComponent,
    ConsultationModalComponent,
    DemoEditorComponent,
    FaqComponent,
    HowWeWorkComponent,
  ],
  templateUrl: './home.page.html'
})
export class HomePage {
  samuel = inject(SamuelDiagnosisService);
}

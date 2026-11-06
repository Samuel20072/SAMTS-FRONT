import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { SolutionsSectionComponent } from '../../components/solutions-section/solutions-section.component';
import { ProjectsSectionComponent } from '../../components/projects-section/projects-section.component';
import { BusinessDemoSectionComponent } from '../../components/business-demo-section/business-demo-section.component';
import { SamtsCatalogSectionComponent } from '../../components/samts-catalog-section/samts-catalog-section.component';
import { PricingSectionComponent } from '../../components/pricing-section/pricing-section.component';
import { SamuelAiSectionComponent } from '../../components/samuel-ai-section/samuel-ai-section.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';
import { SamuelDiagnosisService } from '../../services/samuel-diagnosis.service';
import { DemoEditorComponent } from '../../components/demo-editor/demo-editor.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { HowWeWorkComponent } from '../../components/how-we-work/how-we-work.component';
import { FinalCtaComponent } from '../../components/final-cta/final-cta.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    SolutionsSectionComponent,
    ProjectsSectionComponent,
    BusinessDemoSectionComponent,
    SamtsCatalogSectionComponent,
    PricingSectionComponent,
    SamuelAiSectionComponent,
    FooterComponent,
    ConsultationModalComponent,
    DemoEditorComponent,
    FaqComponent,
    HowWeWorkComponent,
    FinalCtaComponent,
  ],
  templateUrl: './home.page.html'
})
export class HomePage {
  samuel = inject(SamuelDiagnosisService);
}

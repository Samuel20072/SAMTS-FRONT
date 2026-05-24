import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConsultationModalComponent } from '../../components/consultation-modal/consultation-modal.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ConsultationModalComponent],
  templateUrl: './about.page.html'
})
export class AboutPage {
  values = [
    { icon: 'pi-bolt', title: 'Velocidad Neural', desc: 'Sistemas optimizados para cargar en milisegundos y procesar lógica al instante.' },
    { icon: 'pi-shield', title: 'Arquitectura Segura', desc: 'Protección militar de datos. Tu ecosistema y el de tus clientes están a salvo.' },
    { icon: 'pi-objects-column', title: 'Diseño Intuitivo', desc: 'No solo es código, es arte. Interfaces de alta gama que enamoran al usuario.' }
  ];
}

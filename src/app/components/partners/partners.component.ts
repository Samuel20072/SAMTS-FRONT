import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners.component.html'
})
export class PartnersComponent {
  partners = [
    { name: 'BRAND STORE', icon: 'pi pi-shopping-bag' },
    { name: 'NOMAD COFFEE', icon: 'pi pi-palette' },
    { name: 'URBAN FIT', icon: 'pi pi-heart' },
    { name: 'BLOOM STUDIO', icon: 'pi pi-camera' },
    { name: 'NEXUS', icon: 'pi pi-globe' }
  ];
}

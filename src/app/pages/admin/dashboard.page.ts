import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage {
  sidebarOpen = signal(true);
  
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  stats = [
    { title: 'Visitas Hoy', value: '1,284', icon: 'pi pi-eye', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Leads IA', value: '342', icon: 'pi pi-users', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Conversión', value: '12.5%', icon: 'pi pi-chart-line', color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Agentes Activos', value: '3', icon: 'pi pi-microchip', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  recentLeads = [
    { name: 'Carlos Mendoza', email: 'carlos@empresa.com', status: 'Interesado', time: 'Hace 10 min' },
    { name: 'Ana Silva', email: 'ana@startup.io', status: 'Cerrado', time: 'Hace 1 hora' },
    { name: 'Miguel Rojas', email: 'miguel@tienda.com', status: 'En progreso', time: 'Hace 3 horas' },
  ];
}

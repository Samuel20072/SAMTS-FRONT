import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/api/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  sidebarOpen = signal(true);
  private dashboardService = inject(DashboardService);
  
  isLoading = signal(true);
  stats: any[] = [];
  recentSales: any[] = [];
  
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.dashboardService.getSummary().subscribe({
        next: (data) => {
          this.stats = [
            { title: 'Ventas Totales', value: data.totalSales?.toString() || '0', icon: 'pi pi-shopping-cart', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { title: 'Ingresos Totales', value: `$${(data.totalRevenue || 0).toLocaleString()}`, icon: 'pi pi-dollar', color: 'text-green-400', bg: 'bg-green-500/10' },
            { title: 'Productos Activos', value: data.totalProducts?.toString() || '0', icon: 'pi pi-box', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { title: 'Artículos de Blog', value: data.totalBlogPosts?.toString() || '0', icon: 'pi pi-file-edit', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          ];
          this.recentSales = data.recentSales || [];
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading dashboard stats:', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}

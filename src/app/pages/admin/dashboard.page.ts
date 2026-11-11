import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats, RecentLeadItem } from '../../services/api/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  
  isLoading = signal(true);
  hasError = signal(false);
  stats = signal<DashboardStats | null>(null);

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get today(): string {
    return new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get funnelStages() {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalLeads || 1;
    return [
      { label: 'Nuevos', count: s.newLeads, color: 'bg-slate-300', textColor: 'text-slate-800', pct: Math.round((s.newLeads / total) * 100) },
      { label: 'Calificados', count: s.qualifiedLeads, color: 'bg-blue-300', textColor: 'text-blue-900', pct: Math.round((s.qualifiedLeads / total) * 100) },
      { label: 'Propuesta', count: s.proposalSentLeads, color: 'bg-blue-400', textColor: 'text-white', pct: Math.round((s.proposalSentLeads / total) * 100) },
      { label: 'Negociación', count: s.negotiationLeads, color: 'bg-amber-400', textColor: 'text-slate-900', pct: Math.round((s.negotiationLeads / total) * 100) },
      { label: 'Ganados', count: s.wonLeads, color: 'bg-emerald-500', textColor: 'text-white', pct: Math.round((s.wonLeads / total) * 100) },
    ];
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      NEW: 'Nuevo',
      CONTACTED: 'Contactado',
      QUALIFIED: 'Calificado',
      PROPOSAL_SENT: 'Propuesta enviada',
      NEGOTIATION: 'Negociación',
      WON: 'Ganado',
      LOST: 'Perdido',
      FOLLOW_UP: 'Seguimiento pendiente',
      SELECTED: 'Seleccionado',
      WAITLIST: 'Lista de espera',
      ACTIVATED: 'Activado'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-slate-100 text-slate-700 border border-slate-200',
      CONTACTED: 'bg-sky-50 text-sky-700 border border-sky-200',
      QUALIFIED: 'bg-blue-50 text-blue-700 border border-blue-200',
      PROPOSAL_SENT: 'bg-purple-50 text-purple-700 border border-purple-200',
      NEGOTIATION: 'bg-amber-50 text-amber-700 border border-amber-200',
      WON: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      LOST: 'bg-rose-50 text-rose-700 border border-rose-200',
      FOLLOW_UP: 'bg-orange-50 text-orange-700 border border-orange-200',
      SELECTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      WAITLIST: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      ACTIVATED: 'bg-teal-50 text-teal-700 border border-teal-200'
    };
    return map[status] ?? 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadDashboard();
    }
  }

  loadDashboard() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }
}

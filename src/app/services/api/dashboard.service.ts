import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface RecentLeadItem {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  solutionInterest?: string;
  status: string;
  estimatedValue: number;
  createdAt: string;
  followUpDate?: string;
}

export interface DashboardStats {
  // Métricas Comerciales & CRM Reales
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  proposalSentLeads: number;
  negotiationLeads: number;
  wonLeads: number;
  lostLeads: number;
  openOpportunities: number;
  conversionRate: number;
  estimatedPipelineValue: number;
  wonRevenue: number;
  pendingFollowUps: number;
  leadsByStatus: Record<string, number>;
  recentLeads: RecentLeadItem[];

  // Recursos Operativos de SAMTS
  totalProducts: number;
  totalBlogPosts: number;
  totalPromotions: number;
  activePromotions: number;

  // Ventas de compatibilidad
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  recentSales: Array<{ id: string; customerName: string; total: number; status: string; createdAt: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getSummary(tenantId?: string): Observable<DashboardStats> {
    const url = tenantId ? `${this.apiUrl}?tenantId=${tenantId}` : this.apiUrl;
    return this.http.get<DashboardStats>(url);
  }
}

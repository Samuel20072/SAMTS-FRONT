import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'FOLLOW_UP'
  | 'SELECTED'
  | 'WAITLIST'
  | 'ACTIVATED';

export interface CampaignStats {
  campaign: string;
  total: number;
  selected: number;
  remaining: number;
  waitlist: number;
  maxSlots: number;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  whatsapp?: string;
  businessType?: string;
  businessName?: string;
  hasWebsite?: string;
  mainProblem?: string;
  solutionInterest?: string;
  budget?: string;
  urgency?: string;
  details?: string;
  diagnosticSessionId?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  source?: string;
  landingPage?: string;
  referrer?: string;
}

export interface LeadActivity {
  date: string;
  type: string;
  description: string;
  author?: string;
}

export interface LeadResponse {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  businessType: string;
  businessName?: string;
  hasWebsite?: string;
  mainProblem?: string;
  solutionInterest?: string;
  budget?: string;
  urgency?: string;
  details?: string;
  diagnosticSessionId?: string;
  status: LeadStatus;
  notes?: string;
  nextAction?: string;
  followUpDate?: string;
  source?: string;
  campaign: string;
  downloadedPdf: boolean;
  visitedDiagnostic: boolean;
  clickedWhatsapp: boolean;
  convertedToClient: boolean;
  estimatedValue?: number;
  assignedTo?: string;
  dealStage?: string;
  activityHistory?: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeadStatusPayload {
  status?: LeadStatus;
  notes?: string;
  nextAction?: string;
  followUpDate?: string;
  convertedToClient?: boolean;
  estimatedValue?: number;
  assignedTo?: string;
  dealStage?: string;
  activityEntry?: {
    type: string;
    description: string;
    author?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LeadMagnetApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/lead-magnet/leads`;
  private campaignUrl = `${environment.apiUrl}/lead-magnet/campaign`;

  /** Submit lead from lead magnet, consultation modal, or diagnosis */
  createLead(payload: CreateLeadPayload): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(this.baseUrl, payload);
  }

  /** Register for a specific campaign (with slot control) */
  registerCampaign(payload: CreateLeadPayload): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(`${this.campaignUrl}/register`, payload);
  }

  /** Get campaign stats (slots, total, etc) */
  getCampaignStats(campaign: string): Observable<CampaignStats> {
    return this.http.get<CampaignStats>(`${this.campaignUrl}/${campaign}/stats`);
  }

  /** Admin: Get all leads for CRM */
  getAllLeads(): Observable<LeadResponse[]> {
    return this.http.get<LeadResponse[]>(this.baseUrl);
  }

  /** Admin: Get single lead */
  getLeadById(id: string): Observable<LeadResponse> {
    return this.http.get<LeadResponse>(`${this.baseUrl}/${id}`);
  }

  /** Admin: Update status, commercial notes and next action */
  updateLeadStatus(id: string, payload: UpdateLeadStatusPayload): Observable<LeadResponse> {
    return this.http.patch<LeadResponse>(`${this.baseUrl}/${id}/status`, payload);
  }

  /** Admin: Delete lead */
  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Notify backend that lead downloaded the PDF */
  markPdfDownloaded(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/pdf-downloaded`, {});
  }

  /** Notify backend that lead visited the diagnostic */
  markDiagnosticVisited(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/diagnostic-visited`, {});
  }

  /** Notify backend that lead clicked WhatsApp */
  markWhatsappClicked(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/whatsapp-clicked`, {});
  }
}

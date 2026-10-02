import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateLeadMagnetLeadPayload {
  name: string;
  email: string;
  whatsapp?: string;
  businessType: string;
  hasWebsite?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  source?: string;
  landingPage?: string;
  referrer?: string;
}

export interface LeadMagnetLeadResponse {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  businessType: string;
  hasWebsite?: string;
  campaign: string;
  downloadedPdf: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadMagnetApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/lead-magnet/leads`;

  /** Submit the lead magnet form */
  createLead(payload: CreateLeadMagnetLeadPayload): Observable<LeadMagnetLeadResponse> {
    return this.http.post<LeadMagnetLeadResponse>(this.baseUrl, payload);
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

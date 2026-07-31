import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiGenerationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  generateBlog(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-blog`, payload);
  }

  generatePromotion(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-promotion`, payload);
  }

  generateWhatsapp(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-whatsapp`, payload);
  }

  generateBanner(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-banner`, payload);
  }

  getHistory(page?: number, limit?: number, clientId?: string): Observable<any> {
    let url = `${this.apiUrl}/history?`;
    if (page !== undefined) url += `page=${page}&`;
    if (limit !== undefined) url += `limit=${limit}&`;
    if (clientId !== undefined) url += `clientId=${clientId}&`;
    return this.http.get<any>(url);
  }
}

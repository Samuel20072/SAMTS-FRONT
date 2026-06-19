import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/promotions`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(promotion: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, promotion);
  }

  update(id: string, promotion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, promotion);
  }

  updateActiveStatus(id: string, activeData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/active`, activeData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

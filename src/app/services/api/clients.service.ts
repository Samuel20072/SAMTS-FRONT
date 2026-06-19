import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(client: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, client);
  }

  updateMe(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, data);
  }

  updateById(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  updateAiSettings(id: string, aiData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/ai`, aiData);
  }

  updatePlan(id: string, planData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/plan`, planData);
  }

  updateActiveStatus(id: string, activeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/active`, activeData);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sales`;

  getAll(page: number = 0, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(sale: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, sale);
  }

  updateStatus(id: string, statusData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, statusData);
  }
}

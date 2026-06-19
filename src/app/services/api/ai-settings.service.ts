import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiSettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai-settings`;

  get(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  update(settings: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, settings);
  }
}

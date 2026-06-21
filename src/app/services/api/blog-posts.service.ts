import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogPostsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/blog-posts`;

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getPublicAll(clientId?: string): Observable<any> {
    const url = clientId ? `${this.apiUrl}/public?clientId=${clientId}` : `${this.apiUrl}/public`;
    return this.http.get<any>(url);
  }

  getPublicBySlug(slug: string, clientId?: string): Observable<any> {
    const url = clientId ? `${this.apiUrl}/public/slug/${slug}?clientId=${clientId}` : `${this.apiUrl}/public/slug/${slug}`;
    return this.http.get<any>(url);
  }

  create(post: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, post);
  }

  update(id: string, post: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, post);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

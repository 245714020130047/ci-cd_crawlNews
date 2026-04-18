import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Article, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class ArticleService {

  constructor(private http: HttpClient) {}

  getArticles(params: {
    page?: number;
    size?: number;
    category?: string;
    sourceId?: number;
    q?: string;
  } = {}): Observable<Page<Article>> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.sourceId) httpParams = httpParams.set('sourceId', params.sourceId);
    if (params.q) httpParams = httpParams.set('q', params.q);

    return this.http.get<Page<Article>>(`${environment.apiUrl}/articles`, { params: httpParams });
  }

  getArticle(slug: string): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/articles/${slug}`);
  }

  getFeatured(limit = 5): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/home/featured`, {
      params: { limit }
    });
  }

  getLatest(page = 0, size = 10): Observable<Page<Article>> {
    return this.http.get<Page<Article>>(`${environment.apiUrl}/home/latest`, {
      params: { page, size }
    });
  }

  getAiPicks(limit = 6): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/home/ai-picks`, {
      params: { limit }
    });
  }

  getMostRead(limit = 10): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/home/most-read`, {
      params: { limit }
    });
  }

  summarize(slug: string): Observable<Article> {
    return this.http.post<Article>(`${environment.apiUrl}/articles/${slug}/summarize`, {});
  }
}

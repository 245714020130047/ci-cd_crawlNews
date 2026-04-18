import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Dashboard, NewsSource, Stats, Article, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.apiUrl}/admin/dashboard`);
  }

  getSources(): Observable<NewsSource[]> {
    return this.http.get<NewsSource[]>(`${environment.apiUrl}/admin/sources`);
  }

  createSource(source: Partial<NewsSource>): Observable<NewsSource> {
    return this.http.post<NewsSource>(`${environment.apiUrl}/admin/sources`, source);
  }

  updateSource(id: number, source: Partial<NewsSource>): Observable<NewsSource> {
    return this.http.put<NewsSource>(`${environment.apiUrl}/admin/sources/${id}`, source);
  }

  toggleSource(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/admin/sources/${id}/toggle`, { active });
  }

  deleteSource(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/sources/${id}`);
  }

  getArticles(params: { status?: string; page?: number; size?: number } = {}): Observable<Page<Article>> {
    return this.http.get<Page<Article>>(`${environment.apiUrl}/admin/articles`, { params: params as any });
  }

  summarizeArticle(articleId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/admin/articles/${articleId}/summarize`, {});
  }

  toggleCrawler(enabled: boolean): Observable<{ enabled: boolean }> {
    return this.http.post<{ enabled: boolean }>(`${environment.apiUrl}/admin/crawler/toggle`, { enabled });
  }

  runCrawler(sourceId?: number): Observable<void> {
    const body = sourceId ? { sourceId } : {};
    return this.http.post<void>(`${environment.apiUrl}/admin/crawler/run`, body);
  }

  toggleSummarizer(enabled: boolean): Observable<{ enabled: boolean }> {
    return this.http.post<{ enabled: boolean }>(`${environment.apiUrl}/admin/summarizer/toggle`, { enabled });
  }

  getCrawlLogs(page = 0, size = 20): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/crawl-logs`, {
      params: { page, size }
    });
  }
}

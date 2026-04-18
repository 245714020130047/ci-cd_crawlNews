import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Article, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class BookmarkService {

  constructor(private http: HttpClient) {}

  getBookmarks(page = 0, size = 20): Observable<Page<Article>> {
    return this.http.get<Page<Article>>(`${environment.apiUrl}/user/bookmarks`, {
      params: { page, size }
    });
  }

  addBookmark(articleId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/user/bookmarks/${articleId}`, {});
  }

  removeBookmark(articleId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/user/bookmarks/${articleId}`);
  }

  isBookmarked(articleId: number): Observable<{ bookmarked: boolean }> {
    return this.http.get<{ bookmarked: boolean }>(`${environment.apiUrl}/user/bookmarks/${articleId}/check`);
  }
}

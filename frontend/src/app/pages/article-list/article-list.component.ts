import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article, NewsSource } from '../../core/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tất cả tin tức</h1>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="search()"
               placeholder="Tìm kiếm tin tức..." class="input-field max-w-xs">

        <select [(ngModel)]="selectedSource" (change)="search()" class="input-field max-w-[200px]">
          <option [value]="0">Tất cả nguồn</option>
          <option *ngFor="let source of sources" [value]="source.id">{{ source.name }}</option>
        </select>

        <button (click)="search()" class="btn-primary">Tìm kiếm</button>
      </div>

      <!-- Articles grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a *ngFor="let article of articles" [routerLink]="['/article', article.slug]"
           class="card overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
          <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img *ngIf="article.metadata?.thumbnail" [src]="article.metadata?.thumbnail" [alt]="article.title"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <div *ngIf="!article.metadata?.thumbnail" class="w-full h-full flex items-center justify-center text-3xl">📰</div>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="badge-info text-xs">{{ article.metadata?.category || 'Tin tức' }}</span>
              <span *ngIf="article.status === 'SUMMARIZED'" class="badge-success text-xs">AI ✓</span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
              {{ article.title }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">{{ article.metadata?.description }}</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span>{{ article.sourceName }}</span>
              <span>{{ article.crawledAt | date:'dd/MM/yyyy' }}</span>
              <span>👁 {{ article.viewCount }}</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="card overflow-hidden">
          <div class="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && totalPages > 1" class="flex justify-center gap-2 mt-8">
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
                class="btn-secondary text-sm" [class.opacity-50]="currentPage === 0">← Trước</button>
        <span class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          Trang {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                class="btn-secondary text-sm" [class.opacity-50]="currentPage >= totalPages - 1">Sau →</button>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && articles.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">
        <div class="text-4xl mb-4">🔍</div>
        <p>Không tìm thấy bài viết nào</p>
      </div>
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  sources: NewsSource[] = [];
  loading = true;
  searchQuery = '';
  selectedSource = 0;
  currentPage = 0;
  totalPages = 0;

  constructor(
    private articleService: ArticleService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http.get<NewsSource[]>(`${environment.apiUrl}/sources`).subscribe({
      next: (data) => this.sources = data
    });
    this.search();
  }

  search(): void {
    this.currentPage = 0;
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
  }

  private loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles({
      page: this.currentPage,
      size: 12,
      sourceId: this.selectedSource || undefined,
      q: this.searchQuery || undefined
    }).subscribe({
      next: (data) => {
        this.articles = data.content;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}

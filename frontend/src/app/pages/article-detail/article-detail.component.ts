import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { BookmarkService } from '../../core/services/bookmark.service';
import { AuthService } from '../../core/services/auth.service';
import { Article } from '../../core/models';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="article">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <a routerLink="/" class="hover:text-primary-600">Trang chủ</a>
        <span>/</span>
        <a routerLink="/articles" class="hover:text-primary-600">Tin tức</a>
        <span>/</span>
        <span class="text-gray-700 dark:text-gray-300">{{ article.metadata?.category || 'Tin tức' }}</span>
      </nav>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
        {{ article.title }}
      </h1>

      <!-- Meta -->
      <div class="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span class="badge-info">{{ article.sourceName }}</span>
        <span>{{ article.crawledAt | date:'dd/MM/yyyy HH:mm' }}</span>
        <span>👁 {{ article.viewCount }} lượt xem</span>
        <span *ngIf="article.metadata?.author">✍ {{ article.metadata?.author }}</span>

        <div class="flex gap-2 ml-auto">
          <button *ngIf="auth.isLoggedIn()" (click)="toggleBookmark()"
                  class="btn-secondary text-sm flex items-center gap-1">
            {{ isBookmarked ? '❤️ Đã lưu' : '🤍 Lưu bài' }}
          </button>
          <button *ngIf="auth.isLoggedIn() && article.status !== 'SUMMARIZED'"
                  (click)="summarize()" [disabled]="summarizing"
                  class="btn-primary text-sm">
            {{ summarizing ? '⏳ Đang tóm tắt...' : '🤖 Tóm tắt AI' }}
          </button>
        </div>
      </div>

      <!-- Thumbnail -->
      <div *ngIf="article.metadata?.thumbnail" class="mb-6 rounded-xl overflow-hidden">
        <img [src]="article.metadata?.thumbnail" [alt]="article.title" class="w-full object-cover max-h-96">
      </div>

      <!-- AI Summary -->
      <div *ngIf="article.summary" class="card p-6 mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">🤖</span>
          <h2 class="font-bold text-lg text-gray-900 dark:text-white">Tóm tắt AI</h2>
          <span *ngIf="article.summary.provider" class="badge-info text-xs ml-2">{{ article.summary.provider }}</span>
          <span *ngIf="article.summary.sentiment" class="text-xs ml-1"
                [class]="article.summary.sentiment === 'positive' ? 'badge-success' :
                         article.summary.sentiment === 'negative' ? 'badge-danger' : 'badge-warning'">
            {{ article.summary.sentiment }}
          </span>
        </div>

        <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {{ article.summary.summary }}
        </p>

        <div *ngIf="article.summary.key_points?.length" class="mt-4">
          <h3 class="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">Điểm chính:</h3>
          <ul class="space-y-1">
            <li *ngFor="let point of article.summary.key_points" class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span class="text-primary-500 mt-1">•</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Content -->
      <article class="prose prose-lg dark:prose-invert max-w-none">
        <p *ngFor="let paragraph of contentParagraphs" class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          {{ paragraph }}
        </p>
      </article>

      <!-- Source link -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <a [href]="article.url" target="_blank" rel="noopener noreferrer"
           class="text-primary-600 hover:underline text-sm flex items-center gap-1">
          📎 Đọc bài gốc tại {{ article.sourceName }}
        </a>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div *ngIf="loading" class="max-w-4xl mx-auto px-4 py-8">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mb-6"></div>
      <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-6"></div>
      <div class="space-y-3">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" [style.width.%]="80 + i * 3"></div>
      </div>
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  loading = true;
  summarizing = false;
  isBookmarked = false;
  contentParagraphs: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private bookmarkService: BookmarkService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.articleService.getArticle(slug).subscribe({
      next: (article) => {
        this.article = article;
        this.contentParagraphs = article.content?.split('\n\n').filter(p => p.trim()) || [];
        this.loading = false;

        if (this.auth.isLoggedIn()) {
          this.bookmarkService.isBookmarked(article.id).subscribe({
            next: (res) => this.isBookmarked = res.bookmarked
          });
        }
      },
      error: () => this.loading = false
    });
  }

  toggleBookmark(): void {
    if (!this.article) return;
    if (this.isBookmarked) {
      this.bookmarkService.removeBookmark(this.article.id).subscribe({
        next: () => this.isBookmarked = false
      });
    } else {
      this.bookmarkService.addBookmark(this.article.id).subscribe({
        next: () => this.isBookmarked = true
      });
    }
  }

  summarize(): void {
    if (!this.article) return;
    this.summarizing = true;
    this.articleService.summarize(this.article.slug).subscribe({
      next: (updated) => {
        this.article = updated;
        this.summarizing = false;
      },
      error: () => this.summarizing = false
    });
  }
}

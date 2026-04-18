import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero / Featured Section -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          <span class="text-accent-500">⚡</span> Tin nổi bật
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="featured.length > 0">
          <!-- Main featured -->
          <a [routerLink]="['/article', featured[0].slug]" class="card overflow-hidden group cursor-pointer" *ngIf="featured[0]">
            <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img *ngIf="featured[0].metadata?.thumbnail" [src]="featured[0].metadata?.thumbnail" [alt]="featured[0].title"
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <div *ngIf="!featured[0].metadata?.thumbnail" class="w-full h-full flex items-center justify-center text-4xl">📰</div>
            </div>
            <div class="p-5">
              <span class="badge-info mb-2 inline-block">{{ featured[0].metadata?.category || featured[0].sourceName }}</span>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                {{ featured[0].title }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">{{ featured[0].metadata?.description }}</p>
              <div class="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>{{ featured[0].sourceName }}</span>
                <span>{{ featured[0].crawledAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <span>👁 {{ featured[0].viewCount }}</span>
              </div>
            </div>
          </a>

          <!-- Side featured -->
          <div class="flex flex-col gap-4">
            <a *ngFor="let article of featured.slice(1, 5)" [routerLink]="['/article', article.slug]"
               class="card p-4 flex gap-4 group cursor-pointer hover:shadow-md transition-shadow">
              <div class="w-28 h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img *ngIf="article.metadata?.thumbnail" [src]="article.metadata?.thumbnail" [alt]="article.title"
                     class="w-full h-full object-cover">
                <div *ngIf="!article.metadata?.thumbnail" class="w-full h-full flex items-center justify-center">📰</div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                  {{ article.title }}
                </h4>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{{ article.sourceName }}</span>
                  <span>{{ article.crawledAt | date:'dd/MM HH:mm' }}</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Skeleton loader -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="loadingFeatured">
          <div class="card p-5">
            <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div class="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          </div>
          <div class="flex flex-col gap-4">
            <div *ngFor="let i of [1,2,3,4]" class="card p-4 flex gap-4">
              <div class="w-28 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Two columns: Latest + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Latest articles -->
        <section class="lg:col-span-2">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            🕐 Tin mới nhất
          </h2>
          <div class="space-y-4">
            <a *ngFor="let article of latest" [routerLink]="['/article', article.slug]"
               class="card p-4 flex gap-4 group cursor-pointer hover:shadow-md transition-shadow">
              <div class="w-32 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img *ngIf="article.metadata?.thumbnail" [src]="article.metadata?.thumbnail" [alt]="article.title"
                     class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                <span class="badge-info text-xs">{{ article.metadata?.category || 'Tin tức' }}</span>
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 mt-1">
                  {{ article.title }}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-1">{{ article.metadata?.description }}</p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{{ article.sourceName }}</span>
                  <span>{{ article.crawledAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </a>
          </div>

          <div *ngIf="loadingLatest" class="space-y-4">
            <div *ngFor="let i of [1,2,3,4,5]" class="card p-4 flex gap-4">
              <div class="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mt-2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mt-2"></div>
              </div>
            </div>
          </div>

          <button *ngIf="!lastPage" (click)="loadMore()" class="btn-secondary mt-4 w-full">
            Xem thêm tin
          </button>
        </section>

        <!-- Sidebar -->
        <aside>
          <!-- AI Picks -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              🤖 AI gợi ý
            </h2>
            <div class="space-y-3">
              <a *ngFor="let article of aiPicks" [routerLink]="['/article', article.slug]"
                 class="card p-3 block group cursor-pointer hover:shadow-md transition-shadow">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                  {{ article.title }}
                </h4>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{{ article.sourceName }}</span>
                  <span *ngIf="article.summary?.sentiment" class="badge"
                        [class.badge-success]="article.summary?.sentiment === 'positive'"
                        [class.badge-warning]="article.summary?.sentiment === 'neutral'"
                        [class.badge-danger]="article.summary?.sentiment === 'negative'">
                    {{ article.summary?.sentiment }}
                  </span>
                </div>
              </a>
            </div>
          </div>

          <!-- Most Read -->
          <div>
            <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              🔥 Đọc nhiều nhất
            </h2>
            <div class="space-y-3">
              <a *ngFor="let article of mostRead; let i = index" [routerLink]="['/article', article.slug]"
                 class="flex gap-3 group cursor-pointer">
                <span class="text-2xl font-bold text-gray-300 dark:text-gray-600 w-8 flex-shrink-0">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <h4 class="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                    {{ article.title }}
                  </h4>
                  <span class="text-xs text-gray-400">👁 {{ article.viewCount }}</span>
                </div>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  featured: Article[] = [];
  latest: Article[] = [];
  aiPicks: Article[] = [];
  mostRead: Article[] = [];

  loadingFeatured = true;
  loadingLatest = true;
  currentPage = 0;
  lastPage = false;

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getFeatured(5).subscribe({
      next: (data) => { this.featured = data; this.loadingFeatured = false; },
      error: () => this.loadingFeatured = false
    });

    this.articleService.getLatest(0, 10).subscribe({
      next: (data) => {
        this.latest = data.content;
        this.lastPage = data.last;
        this.loadingLatest = false;
      },
      error: () => this.loadingLatest = false
    });

    this.articleService.getAiPicks(6).subscribe({
      next: (data) => this.aiPicks = data
    });

    this.articleService.getMostRead(10).subscribe({
      next: (data) => this.mostRead = data
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.articleService.getLatest(this.currentPage, 10).subscribe({
      next: (data) => {
        this.latest = [...this.latest, ...data.content];
        this.lastPage = data.last;
      }
    });
  }
}

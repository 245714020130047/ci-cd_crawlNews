import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Dashboard } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div *ngIf="dashboard">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold text-primary-600">{{ dashboard.stats.totalArticles }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng bài viết</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold text-green-600">{{ dashboard.stats.summarizedArticles }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Đã tóm tắt</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ dashboard.stats.pendingArticles }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Chờ xử lý</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold text-red-600">{{ dashboard.stats.failedArticles }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Thất bại</div>
        </div>
      </div>

      <!-- Scheduler controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">🕷️ Crawler Scheduler</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tự động crawl tin tức từ các nguồn</p>
            </div>
            <button (click)="toggleCrawler()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    [class.bg-primary-600]="dashboard.crawlerEnabled" [class.bg-gray-300]="!dashboard.crawlerEnabled">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    [class.translate-x-6]="dashboard.crawlerEnabled" [class.translate-x-1]="!dashboard.crawlerEnabled"></span>
            </button>
          </div>
          <button (click)="runCrawler()" class="btn-primary text-sm mt-3">▶ Crawl ngay</button>
        </div>

        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">🤖 Summarizer Scheduler</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tự động tóm tắt bài viết bằng AI</p>
            </div>
            <button (click)="toggleSummarizer()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    [class.bg-primary-600]="dashboard.summarizerEnabled" [class.bg-gray-300]="!dashboard.summarizerEnabled">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    [class.translate-x-6]="dashboard.summarizerEnabled" [class.translate-x-1]="!dashboard.summarizerEnabled"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sources overview -->
      <div class="card p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Nguồn tin</h3>
        <div class="space-y-3">
          <div *ngFor="let source of dashboard.sources" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">{{ source.name }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">{{ source.baseUrl }}</span>
            </div>
            <span [class]="source.active ? 'badge-success' : 'badge-danger'">
              {{ source.active ? 'Hoạt động' : 'Tắt' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="!dashboard" class="space-y-4">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
      <div class="grid grid-cols-4 gap-4">
        <div *ngFor="let i of [1,2,3,4]" class="card p-4 h-20 animate-pulse bg-gray-100 dark:bg-gray-700"></div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getDashboard().subscribe({
      next: (data) => this.dashboard = data
    });
  }

  toggleCrawler(): void {
    if (!this.dashboard) return;
    const newState = !this.dashboard.crawlerEnabled;
    this.adminService.toggleCrawler(newState).subscribe({
      next: () => { if (this.dashboard) this.dashboard.crawlerEnabled = newState; }
    });
  }

  toggleSummarizer(): void {
    if (!this.dashboard) return;
    const newState = !this.dashboard.summarizerEnabled;
    this.adminService.toggleSummarizer(newState).subscribe({
      next: () => { if (this.dashboard) this.dashboard.summarizerEnabled = newState; }
    });
  }

  runCrawler(): void {
    this.adminService.runCrawler().subscribe({
      next: () => alert('Đã bắt đầu crawl!'),
      error: () => alert('Lỗi khi crawl')
    });
  }
}

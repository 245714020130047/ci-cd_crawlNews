import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Article } from '../../../core/models';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quản lý bài viết</h1>

      <!-- Filter -->
      <div class="flex gap-4 mb-6">
        <select [(ngModel)]="statusFilter" (change)="load()" class="input-field max-w-[200px]">
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Pending</option>
          <option value="SUMMARIZED">Summarized</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <!-- Articles table -->
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tiêu đề</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nguồn</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Trạng thái</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Ngày</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let article of articles" class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-3">
                <a [href]="'/article/' + article.slug" target="_blank" class="text-primary-600 hover:underline line-clamp-1">
                  {{ article.title }}
                </a>
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ article.sourceName }}</td>
              <td class="px-4 py-3">
                <span [class]="article.status === 'SUMMARIZED' ? 'badge-success' :
                               article.status === 'PENDING' ? 'badge-warning' : 'badge-danger'">
                  {{ article.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ article.crawledAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-3">
                <button *ngIf="article.status !== 'SUMMARIZED'" (click)="summarize(article)"
                        [disabled]="article.status === 'PROCESSING'"
                        class="btn-primary text-xs">
                  🤖 Tóm tắt
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex justify-center gap-2 mt-4">
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0" class="btn-secondary text-sm">←</button>
        <span class="px-4 py-2 text-sm text-gray-500">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1" class="btn-secondary text-sm">→</button>
      </div>
    </div>
  `
})
export class AdminArticlesComponent implements OnInit {
  articles: Article[] = [];
  statusFilter = '';
  currentPage = 0;
  totalPages = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getArticles({
      status: this.statusFilter || undefined,
      page: this.currentPage,
      size: 20
    }).subscribe({
      next: (data) => {
        this.articles = data.content;
        this.totalPages = data.totalPages;
      }
    });
  }

  summarize(article: Article): void {
    this.adminService.summarizeArticle(article.id).subscribe({
      next: () => {
        article.status = 'SUMMARIZED';
      },
      error: () => alert('Lỗi khi tóm tắt')
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.load();
  }
}

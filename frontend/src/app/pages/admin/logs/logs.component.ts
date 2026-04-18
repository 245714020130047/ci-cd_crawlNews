import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Crawl Logs</h1>

      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nguồn</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Bắt đầu</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Kết thúc</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tìm thấy</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Mới</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Trùng</th>
            </tr>
            
          </thead>
          <tbody>
            <tr *ngFor="let log of logs" class="border-t border-gray-100 dark:border-gray-700">
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ log.source?.name || 'N/A' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ log.startedAt | date:'dd/MM HH:mm:ss' }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ log.finishedAt | date:'dd/MM HH:mm:ss' }}</td>
              <td class="px-4 py-3 text-right">{{ log.articlesFound }}</td>
              <td class="px-4 py-3 text-right text-green-600">{{ log.articlesNew }}</td>
              <td class="px-4 py-3 text-right text-yellow-600">{{ log.articlesFound - log.articlesNew }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="logs.length === 0" class="text-center py-8 text-gray-500">
        Chưa có crawl log nào
      </div>
    </div>
  `
})
export class LogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getCrawlLogs().subscribe({
      next: (data) => this.logs = data
    });
  }
}

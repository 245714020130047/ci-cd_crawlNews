import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NewsSource } from '../../../core/models';

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Quản lý nguồn tin</h1>
        <button (click)="showForm = !showForm" class="btn-primary text-sm">
          {{ showForm ? 'Hủy' : '+ Thêm nguồn' }}
        </button>
      </div>

      <!-- Add/Edit form -->
      <div *ngIf="showForm" class="card p-5 mb-6">
        <h3 class="font-semibold mb-4">{{ editingId ? 'Sửa nguồn tin' : 'Thêm nguồn tin mới' }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên nguồn</label>
            <input type="text" [(ngModel)]="formData.name" class="input-field" placeholder="VnExpress">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base URL</label>
            <input type="text" [(ngModel)]="formData.baseUrl" class="input-field" placeholder="https://vnexpress.net">
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crawl Config (JSON)</label>
          <textarea [(ngModel)]="crawlConfigJson" class="input-field h-24 font-mono text-sm"
                    placeholder='{"rssUrl": "...", "selectors": {...}}'></textarea>
        </div>
        <div class="flex gap-2 mt-4">
          <button (click)="save()" class="btn-primary text-sm">{{ editingId ? 'Cập nhật' : 'Tạo' }}</button>
          <button (click)="resetForm()" class="btn-secondary text-sm">Hủy</button>
        </div>
      </div>

      <!-- Sources list -->
      <div class="space-y-3">
        <div *ngFor="let source of sources" class="card p-4 flex items-center justify-between">
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white">{{ source.name }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ source.baseUrl }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span [class]="source.active ? 'badge-success' : 'badge-danger'">
              {{ source.active ? 'ON' : 'OFF' }}
            </span>
            <button (click)="toggle(source)" class="btn-secondary text-xs">
              {{ source.active ? 'Tắt' : 'Bật' }}
            </button>
            <button (click)="edit(source)" class="btn-secondary text-xs">Sửa</button>
            <button (click)="remove(source.id)" class="btn-danger text-xs">Xóa</button>
            <button (click)="crawlNow(source.id)" class="btn-primary text-xs">Crawl</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SourcesComponent implements OnInit {
  sources: NewsSource[] = [];
  showForm = false;
  editingId: number | null = null;
  formData: Partial<NewsSource> = { name: '', baseUrl: '', active: true };
  crawlConfigJson = '{}';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.getSources().subscribe({
      next: (data) => this.sources = data
    });
  }

  save(): void {
    try {
      this.formData.crawlConfig = JSON.parse(this.crawlConfigJson);
    } catch {
      alert('Invalid JSON');
      return;
    }

    if (this.editingId) {
      this.adminService.updateSource(this.editingId, this.formData).subscribe({
        next: () => { this.load(); this.resetForm(); }
      });
    } else {
      this.adminService.createSource(this.formData).subscribe({
        next: () => { this.load(); this.resetForm(); }
      });
    }
  }

  edit(source: NewsSource): void {
    this.editingId = source.id;
    this.formData = { name: source.name, baseUrl: source.baseUrl, active: source.active };
    this.crawlConfigJson = JSON.stringify(source.crawlConfig, null, 2);
    this.showForm = true;
  }

  toggle(source: NewsSource): void {
    this.adminService.toggleSource(source.id, !source.active).subscribe({
      next: () => { source.active = !source.active; }
    });
  }

  remove(id: number): void {
    if (confirm('Xóa nguồn tin này?')) {
      this.adminService.deleteSource(id).subscribe({
        next: () => this.load()
      });
    }
  }

  crawlNow(sourceId: number): void {
    this.adminService.runCrawler(sourceId).subscribe({
      next: () => alert('Đã bắt đầu crawl!'),
      error: () => alert('Lỗi')
    });
  }

  resetForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.formData = { name: '', baseUrl: '', active: true };
    this.crawlConfigJson = '{}';
  }
}

import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookmarkService } from '../../core/services/bookmark.service';
import { Article } from '../../core/models';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">📌 Bài viết đã lưu</h1>

      <div class="space-y-4">
        <div *ngFor="let article of bookmarks"
             class="card p-4 flex gap-4">
          <div class="w-32 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img *ngIf="article.metadata?.thumbnail" [src]="article.metadata?.thumbnail" [alt]="article.title"
                 class="w-full h-full object-cover">
          </div>
          <div class="flex-1 min-w-0">
            <a [routerLink]="['/article', article.slug]"
               class="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-2">
              {{ article.title }}
            </a>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{{ article.sourceName }}</span>
              <span>{{ article.crawledAt | date:'dd/MM/yyyy' }}</span>
            </div>
            <button (click)="remove(article.id)" class="text-red-500 hover:text-red-600 text-xs mt-2">
              Xóa khỏi đã lưu
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && bookmarks.length === 0" class="text-center py-16 text-gray-500">
        <div class="text-4xl mb-4">📭</div>
        <p>Bạn chưa lưu bài viết nào</p>
      </div>
    </div>
  `
})
export class BookmarksComponent implements OnInit {
  bookmarks: Article[] = [];
  loading = true;

  constructor(private bookmarkService: BookmarkService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bookmarkService.getBookmarks().subscribe({
      next: (data) => {
        this.bookmarks = data.content;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  remove(articleId: number): void {
    this.bookmarkService.removeBookmark(articleId).subscribe({
      next: () => {
        this.bookmarks = this.bookmarks.filter(b => b.id !== articleId);
      }
    });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-primary-600">📰</span>
            <span class="text-xl font-bold text-gray-900 dark:text-white">NewsCrawler</span>
          </a>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <a routerLink="/" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Trang chủ</a>
            <a routerLink="/articles" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Tin tức</a>
          </nav>

          <!-- Auth buttons -->
          <div class="flex items-center gap-3">
            <ng-container *ngIf="!auth.isLoggedIn()">
              <a routerLink="/login" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors">Đăng nhập</a>
              <a routerLink="/register" class="btn-primary text-sm">Đăng ký</a>
            </ng-container>

            <ng-container *ngIf="auth.isLoggedIn()">
              <a *ngIf="auth.isAdmin()" routerLink="/admin" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors text-sm">Admin</a>
              <a routerLink="/bookmarks" class="text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium transition-colors text-sm">Đã lưu</a>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ auth.username() }}</span>
              <button (click)="auth.logout()" class="btn-secondary text-sm">Đăng xuất</button>
            </ng-container>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}
}

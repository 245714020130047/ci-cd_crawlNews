import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <aside class="w-56 flex-shrink-0">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">⚙️ Quản trị</h2>
          <nav class="space-y-1">
            <a routerLink="/admin/dashboard" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600"
               class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              📊 Dashboard
            </a>
            <a routerLink="/admin/sources" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600"
               class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              🌐 Nguồn tin
            </a>
            <a routerLink="/admin/articles" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600"
               class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              📰 Bài viết
            </a>
            <a routerLink="/admin/logs" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-600"
               class="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              📋 Crawl Logs
            </a>
          </nav>
        </aside>

        <!-- Content -->
        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {}

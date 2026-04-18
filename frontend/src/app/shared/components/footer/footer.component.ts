import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">📰</span>
            <span class="font-bold text-gray-900 dark:text-white">NewsCrawler</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2024 NewsCrawler. Tổng hợp tin tức & tóm tắt bằng AI.
          </p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}

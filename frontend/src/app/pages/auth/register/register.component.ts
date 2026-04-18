import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4">
      <div class="card p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>

        <div *ngIf="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên người dùng</label>
            <input type="text" [(ngModel)]="username" name="username" class="input-field" placeholder="username" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="input-field" placeholder="your@email.com" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
            <input type="password" [(ngModel)]="password" name="password" class="input-field" placeholder="Tối thiểu 8 ký tự" required>
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary w-full">
            {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Đã có tài khoản? <a routerLink="/login" class="text-primary-600 hover:underline">Đăng nhập</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.error || err.error?.fieldErrors
          ? Object.values(err.error.fieldErrors).join(', ')
          : 'Đăng ký thất bại';
        this.loading = false;
      }
    });
  }
}

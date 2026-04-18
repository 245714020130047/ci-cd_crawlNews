import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  private _isLoggedIn = signal(this.hasToken());
  private _userRole = signal(this.getStoredRole());
  private _username = signal(this.getStoredUsername());

  isLoggedIn = this._isLoggedIn.asReadonly();
  userRole = this._userRole.asReadonly();
  username = this._username.asReadonly();
  isAdmin = computed(() => this._userRole() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe();
    this.clearAuth();
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuth(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ role: res.role, username: res.username }));
    this._isLoggedIn.set(true);
    this._userRole.set(res.role);
    this._username.set(res.username);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._isLoggedIn.set(false);
    this._userRole.set('');
    this._username.set('');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRole(): string {
    try {
      const info = localStorage.getItem(this.USER_KEY);
      return info ? JSON.parse(info).role : '';
    } catch { return ''; }
  }

  private getStoredUsername(): string {
    try {
      const info = localStorage.getItem(this.USER_KEY);
      return info ? JSON.parse(info).username : '';
    } catch { return ''; }
  }
}

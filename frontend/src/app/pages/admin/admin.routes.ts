import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'sources',
        loadComponent: () => import('./sources/sources.component').then(m => m.SourcesComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./articles/admin-articles.component').then(m => m.AdminArticlesComponent)
      },
      {
        path: 'logs',
        loadComponent: () => import('./logs/logs.component').then(m => m.LogsComponent)
      }
    ]
  }
];

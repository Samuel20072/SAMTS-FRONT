import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.page').then(m => m.PricingPage)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/portfolio.page').then(m => m.PortfolioPage)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog.page').then(m => m.BlogPage)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/blog-detail.page').then(m => m.BlogDetailPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard.page').then(m => m.DashboardPage) },
      { path: 'leads', loadComponent: () => import('./pages/admin/leads/leads.component').then(m => m.LeadsComponent) },
      { path: 'pages', loadComponent: () => import('./pages/admin/pages/web-pages.component').then(m => m.WebPagesComponent) },
      { path: 'agents', loadComponent: () => import('./pages/admin/agents/agents.component').then(m => m.AgentsComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/admin/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/products.component').then(m => m.ProductsComponent) },
      { path: 'promotions', loadComponent: () => import('./pages/admin/promotions/promotions.component').then(m => m.PromotionsComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

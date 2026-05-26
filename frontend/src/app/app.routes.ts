import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/templates', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'templates',
        children: [
          { path: '', loadComponent: () => import('./features/templates/list/template-list.component').then(m => m.TemplateListComponent) },
          { path: 'new', loadComponent: () => import('./features/templates/form/template-form.component').then(m => m.TemplateFormComponent) },
          { path: ':id', loadComponent: () => import('./features/templates/detail/template-detail.component').then(m => m.TemplateDetailComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/templates/form/template-form.component').then(m => m.TemplateFormComponent) },
        ],
      },
      {
        path: 'checklists',
        children: [
          { path: '', loadComponent: () => import('./features/checklists/list/checklist-list.component').then(m => m.ChecklistListComponent) },
          { path: 'new', loadComponent: () => import('./features/checklists/form/checklist-form.component').then(m => m.ChecklistFormComponent) },
          { path: ':id', loadComponent: () => import('./features/checklists/detail/checklist-detail.component').then(m => m.ChecklistDetailComponent) },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '/templates' },
];

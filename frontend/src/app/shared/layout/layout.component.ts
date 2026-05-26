import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <div class="flex h-screen bg-slate-950 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <!-- Logo -->
        <div class="px-6 py-5 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <i class="pi pi-check-square text-violet-400 text-2xl"></i>
            <span class="text-xl font-bold text-white">Checkbook</span>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1">
          <a routerLink="/templates" routerLinkActive="bg-violet-600 text-white"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <i class="pi pi-list text-lg"></i>
            <span class="font-medium">Templates</span>
          </a>
          <a routerLink="/checklists" routerLinkActive="bg-violet-600 text-white"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <i class="pi pi-check-circle text-lg"></i>
            <span class="font-medium">My Checklists</span>
          </a>
        </nav>

        <!-- User info -->
        <div class="px-4 py-4 border-t border-slate-800">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold">
              {{ initials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ auth.currentUser()?.name }}</p>
              <p class="text-slate-400 text-xs truncate">{{ auth.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="auth.logout()"
            class="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
            <i class="pi pi-sign-out"></i>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}

  initials() {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}

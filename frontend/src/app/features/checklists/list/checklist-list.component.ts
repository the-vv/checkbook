import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ChecklistsService } from '../../../core/services/checklists.service';
import { TemplatesService } from '../../../core/services/templates.service';
import { ChecklistInstance, Template } from '../../../core/models';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, SkeletonModule, ConfirmDialogModule, ToastModule, SelectModule, FormsModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="p-6">
      <p-toast />
      <p-confirmDialog />

      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">My Checklists</h1>
          <p class="text-slate-400 mt-1">Track your checklist uses</p>
        </div>
        <a routerLink="/checklists/new">
          <p-button label="New Checklist" icon="pi pi-plus" />
        </a>
      </div>

      <!-- Filter -->
      <div class="mb-4 flex items-center gap-3">
        <p-select [options]="filterOptions" [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()"
          optionLabel="label" optionValue="value"
          styleClass="bg-slate-800 border-slate-700"
          placeholder="Filter by status" />
        <p-select [options]="templateOptions" [(ngModel)]="templateFilter" (ngModelChange)="applyFilter()"
          optionLabel="label" optionValue="value"
          styleClass="bg-slate-800 border-slate-700"
          placeholder="Filter by template" />
        @if (statusFilter || templateFilter) {
          <p-button label="Clear" severity="secondary" [text]="true" size="small"
            (onClick)="clearFilters()" icon="pi pi-times" />
        }
      </div>

      @if (loading) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p-skeleton height="1.25rem" width="40%" styleClass="mb-2" />
              <p-skeleton height="1rem" width="25%" />
            </div>
          }
        </div>
      } @else if (filtered.length === 0) {
        <div class="text-center py-16">
          <i class="pi pi-check-circle text-slate-600 text-6xl mb-4 block"></i>
          <h3 class="text-slate-400 text-lg mb-2">No checklists found</h3>
          <p class="text-slate-500 text-sm mb-6">Start using a template to create checklists</p>
          <a routerLink="/templates">
            <p-button label="Browse Templates" icon="pi pi-list" />
          </a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (cl of filtered; track cl.id) {
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-violet-700 transition-colors">
              <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-white font-semibold truncate">{{ cl.title }}</h3>
                    <p-tag [value]="cl.status" [severity]="cl.status === 'completed' ? 'success' : 'warn'" />
                  </div>
                  <div class="flex items-center gap-3 text-slate-400 text-sm">
                    <span class="flex items-center gap-1">
                      <i class="pi pi-list text-xs"></i>
                      {{ cl.template?.name || 'Unknown template' }}
                    </span>
                    <span>•</span>
                    <span>{{ progress(cl) }}% complete</span>
                    <span>•</span>
                    <span>{{ cl.createdAt | date:'mediumDate' }}</span>
                  </div>
                  <!-- Progress bar -->
                  <div class="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                      [class]="cl.status === 'completed' ? 'bg-green-500' : 'bg-violet-500'"
                      [style.width.%]="progress(cl)"></div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a [routerLink]="['/checklists', cl.id]">
                    <p-button icon="pi pi-eye" size="small" severity="secondary" />
                  </a>
                  <p-button icon="pi pi-trash" size="small" severity="danger" [text]="true"
                    (onClick)="confirmDelete(cl)" />
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ChecklistListComponent implements OnInit {
  checklists: ChecklistInstance[] = [];
  filtered: ChecklistInstance[] = [];
  templates: Template[] = [];
  loading = true;
  statusFilter: string | null = null;
  templateFilter: number | null = null;

  filterOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];
  templateOptions: { label: string; value: number | null }[] = [{ label: 'All Templates', value: null }];

  constructor(
    private checklistsService: ChecklistsService,
    private templatesService: TemplatesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.checklistsService.getAll().subscribe({
      next: (c) => { this.checklists = c; this.filtered = c; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.templatesService.getAll().subscribe((t) => {
      this.templates = t;
      this.templateOptions = [
        { label: 'All Templates', value: null },
        ...t.map((tpl) => ({ label: tpl.name, value: tpl.id })),
      ];
    });
  }

  progress(cl: ChecklistInstance): number {
    if (!cl.items?.length) return 0;
    return Math.round((cl.items.filter((i) => i.checked).length / cl.items.length) * 100);
  }

  applyFilter() {
    this.filtered = this.checklists.filter((c) => {
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchTemplate = !this.templateFilter || c.templateId === this.templateFilter;
      return matchStatus && matchTemplate;
    });
  }

  clearFilters() {
    this.statusFilter = null;
    this.templateFilter = null;
    this.filtered = this.checklists;
  }

  confirmDelete(cl: ChecklistInstance) {
    this.confirmationService.confirm({
      message: `Delete "${cl.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.checklistsService.delete(cl.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.checklists = this.checklists.filter((c) => c.id !== cl.id);
            this.applyFilter();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete' }),
        });
      },
    });
  }
}

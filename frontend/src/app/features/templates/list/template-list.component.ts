import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TemplatesService } from '../../../core/services/templates.service';
import { Template } from '../../../core/models';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule, SkeletonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="p-6">
      <p-toast />
      <p-confirmDialog />

      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Templates</h1>
          <p class="text-slate-400 mt-1">Reusable checklist templates</p>
        </div>
        <a routerLink="/templates/new">
          <p-button label="New Template" icon="pi pi-plus" />
        </a>
      </div>

      @if (loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p-skeleton height="1.5rem" styleClass="mb-3" />
              <p-skeleton height="1rem" width="60%" styleClass="mb-4" />
              <p-skeleton height="1rem" width="40%" />
            </div>
          }
        </div>
      } @else if (templates.length === 0) {
        <div class="text-center py-16">
          <i class="pi pi-list text-slate-600 text-6xl mb-4 block"></i>
          <h3 class="text-slate-400 text-lg mb-2">No templates yet</h3>
          <p class="text-slate-500 text-sm mb-6">Create your first checklist template to get started</p>
          <a routerLink="/templates/new">
            <p-button label="Create Template" icon="pi pi-plus" />
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (template of templates; track template.id) {
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-violet-700 transition-colors group">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold text-lg truncate">{{ template.name }}</h3>
                  @if (template.description) {
                    <p class="text-slate-400 text-sm mt-1 line-clamp-2">{{ template.description }}</p>
                  }
                </div>
              </div>

              <div class="flex items-center gap-3 mb-4">
                <span class="flex items-center gap-1 text-slate-400 text-sm">
                  <i class="pi pi-list text-xs"></i>
                  {{ template.items?.length || 0 }} items
                </span>
                <span class="flex items-center gap-1 text-slate-400 text-sm">
                  <i class="pi pi-check-circle text-xs"></i>
                  {{ template.instances?.length || 0 }} uses
                </span>
              </div>

              <div class="flex items-center gap-2">
                <a [routerLink]="['/templates', template.id]" class="flex-1">
                  <p-button label="View" icon="pi pi-eye" styleClass="w-full" size="small" severity="secondary" />
                </a>
                <a [routerLink]="['/checklists/new']" [queryParams]="{ templateId: template.id }">
                  <p-button label="Use" icon="pi pi-play" size="small" />
                </a>
                <p-button icon="pi pi-trash" size="small" severity="danger" [text]="true"
                  (onClick)="confirmDelete(template)" />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TemplateListComponent implements OnInit {
  templates: Template[] = [];
  loading = true;

  constructor(
    private templatesService: TemplatesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    this.templatesService.getAll().subscribe({
      next: (t) => { this.templates = t; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  confirmDelete(template: Template) {
    this.confirmationService.confirm({
      message: `Delete "${template.name}"? This will also delete all checklist instances.`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.deleteTemplate(template.id),
    });
  }

  deleteTemplate(id: number) {
    this.templatesService.delete(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Template removed' });
        this.templates = this.templates.filter((t) => t.id !== id);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete' }),
    });
  }
}

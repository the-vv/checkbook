import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TemplatesService } from '../../../core/services/templates.service';
import { Template, ChecklistInstance } from '../../../core/models';
import { ChecklistsService } from '../../../core/services/checklists.service';

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <p-toast />

      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/templates" class="text-slate-400 hover:text-white transition-colors">
          <i class="pi pi-arrow-left text-xl"></i>
        </a>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-white">{{ template()?.name }}</h1>
          @if (template()?.description) {
            <p class="text-slate-400 mt-1">{{ template()?.description }}</p>
          }
        </div>
        <a [routerLink]="['/templates', template()?.id, 'edit']">
          <p-button icon="pi pi-pencil" label="Edit" severity="secondary" size="small" />
        </a>
        <a [routerLink]="['/checklists/new']" [queryParams]="{ templateId: template()?.id }">
          <p-button icon="pi pi-play" label="Use Template" size="small" />
        </a>
      </div>

      @if (template(); as template) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Template Items -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-white font-semibold">Template Items</h3>
              <span class="text-slate-400 text-sm">{{ template.items?.length || 0 }} items</span>
            </div>

            @if (template.items?.length === 0) {
              <p class="text-slate-500 text-sm text-center py-6">No items in this template</p>
            } @else {
              <div class="space-y-2">
                @for (item of sortedItems; track item.id) {
                  <div class="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                    <div class="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                    <span class="text-slate-300">{{ item.text }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Usage History -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-white font-semibold">Usage History</h3>
              <span class="text-slate-400 text-sm">{{ checklists().length }} uses</span>
            </div>

            @if (checklists().length === 0) {
              <div class="text-center py-6">
                <p class="text-slate-500 text-sm mb-3">Not used yet</p>
                <a [routerLink]="['/checklists/new']" [queryParams]="{ templateId: template.id }">
                  <p-button label="Start First Checklist" icon="pi pi-play" size="small" />
                </a>
              </div>
            } @else {
              <div class="space-y-2">
                @for (cl of checklists(); track cl.id) {
                  <a [routerLink]="['/checklists', cl.id]"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                    <div class="flex-1 min-w-0">
                      <p class="text-white text-sm font-medium truncate">{{ cl.title }}</p>
                      <p class="text-slate-400 text-xs mt-0.5">{{ cl.createdAt | date:'mediumDate' }}</p>
                    </div>
                    <p-tag [value]="cl.status" [severity]="cl.status === 'completed' ? 'success' : 'warn'" />
                    <i class="pi pi-chevron-right text-slate-500 text-sm"></i>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TemplateDetailComponent implements OnInit {
  template = signal<Template | null>(null);
  checklists = signal<ChecklistInstance[]>([]);

  get sortedItems() {
    return [...(this.template()?.items || [])].sort((a, b) => a.order - b.order);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templatesService: TemplatesService,
    private checklistsService: ChecklistsService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.templatesService.getOne(id).subscribe((t) => {
      this.template.set(t);
    });
    this.checklistsService.getAll(id).subscribe((c) => {
      this.checklists.set(c);
    });
  }
}

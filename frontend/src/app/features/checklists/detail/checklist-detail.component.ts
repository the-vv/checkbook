import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ChecklistsService } from '../../../core/services/checklists.service';
import { ChecklistInstance, InstanceItem } from '../../../core/models';

@Component({
  selector: 'app-checklist-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, CheckboxModule, ToastModule, FormsModule],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <p-toast />

      @if (checklist) {
        <div class="flex items-center gap-3 mb-6">
          <a routerLink="/checklists" class="text-slate-400 hover:text-white transition-colors">
            <i class="pi pi-arrow-left text-xl"></i>
          </a>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-white">{{ checklist.title }}</h1>
              <p-tag [value]="checklist.status" [severity]="checklist.status === 'completed' ? 'success' : 'warn'" />
            </div>
            @if (checklist.template) {
              <p class="text-slate-400 mt-1 text-sm">
                Template: <a [routerLink]="['/templates', checklist.templateId]" class="text-violet-400 hover:text-violet-300">{{ checklist.template.name }}</a>
              </p>
            }
          </div>
          @if (checklist.status !== 'completed') {
            <p-button label="Mark Complete" icon="pi pi-check-circle" size="small"
              severity="success" (onClick)="markComplete()" [loading]="saving" />
          }
        </div>

        @if (checklist.notes) {
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
            <p class="text-slate-300 text-sm">{{ checklist.notes }}</p>
          </div>
        }

        <!-- Progress -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-white font-medium">Progress</span>
            <span class="text-slate-300 font-semibold text-lg">{{ checkedCount }}/{{ checklist.items?.length || 0 }}</span>
          </div>
          <div class="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300"
              [class]="checklist.status === 'completed' ? 'bg-green-500' : 'bg-violet-500'"
              [style.width.%]="progressPct"></div>
          </div>
          <p class="text-slate-400 text-sm mt-2">{{ progressPct }}% complete</p>
        </div>

        <!-- Items -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold">Items</h3>
            @if (checklist.status !== 'completed') {
              <p-button type="button" label="Add Item" icon="pi pi-plus" size="small"
                severity="secondary" (onClick)="startAddItem()" />
            }
          </div>

          <div class="space-y-1">
            @for (item of sortedItems; track item.id) {
              <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
                [class.opacity-50]="checklist.status === 'completed'">
                <p-checkbox [(ngModel)]="item.checked" [binary]="true"
                  (onChange)="toggleItem(item)"
                  [disabled]="checklist.status === 'completed'" />
                <span class="flex-1 text-slate-300" [class.line-through]="item.checked"
                  [class.text-slate-500]="item.checked">
                  {{ item.text }}
                </span>
                @if (!item.templateItemId) {
                  <span class="text-violet-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">extra</span>
                }
              </div>
            }
          </div>

          <!-- Add item inline -->
          @if (addingItem) {
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <input #newItemInput class="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                placeholder="New item..." [(ngModel)]="newItemText"
                (keyup.enter)="saveNewItem()" (keyup.escape)="cancelAddItem()" />
              <p-button icon="pi pi-check" size="small" (onClick)="saveNewItem()" [disabled]="!newItemText.trim()" />
              <p-button icon="pi pi-times" size="small" severity="secondary" (onClick)="cancelAddItem()" />
            </div>
          }
        </div>

        <p class="text-slate-500 text-xs text-center mt-4">
          Created {{ checklist.createdAt | date:'medium' }}
          @if (checklist.updatedAt !== checklist.createdAt) {
            · Updated {{ checklist.updatedAt | date:'medium' }}
          }
        </p>
      } @else {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-violet-400 text-4xl"></i>
        </div>
      }
    </div>
  `,
})
export class ChecklistDetailComponent implements OnInit {
  checklist: ChecklistInstance | null = null;
  saving = false;
  addingItem = false;
  newItemText = '';

  get sortedItems() {
    return [...(this.checklist?.items || [])].sort((a, b) => a.order - b.order);
  }

  get checkedCount() { return this.checklist?.items?.filter((i) => i.checked).length || 0; }

  get progressPct() {
    const total = this.checklist?.items?.length || 0;
    if (!total) return 0;
    return Math.round((this.checkedCount / total) * 100);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checklistsService: ChecklistsService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.loadChecklist(id);
  }

  loadChecklist(id: number) {
    this.checklistsService.getOne(id).subscribe((c) => { this.checklist = c; });
  }

  toggleItem(item: InstanceItem) {
    if (!this.checklist) return;
    const items = this.checklist.items.map((i) => ({
      id: i.id,
      text: i.text,
      checked: i.id === item.id ? item.checked : i.checked,
      order: i.order,
      templateItemId: i.templateItemId,
    }));
    this.checklistsService.update(this.checklist.id, { items }).subscribe({
      error: () => {
        item.checked = !item.checked;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not save' });
      },
    });
  }

  startAddItem() { this.addingItem = true; this.newItemText = ''; }

  cancelAddItem() { this.addingItem = false; this.newItemText = ''; }

  saveNewItem() {
    if (!this.newItemText.trim() || !this.checklist) return;
    const currentItems = this.checklist.items.map((i) => ({
      text: i.text,
      checked: i.checked,
      order: i.order,
      templateItemId: i.templateItemId,
    }));
    const newOrder = currentItems.length;
    this.checklistsService.update(this.checklist.id, {
      items: [...currentItems, { text: this.newItemText.trim(), checked: false, order: newOrder }],
    }).subscribe({
      next: (updated) => {
        this.checklist = updated;
        this.cancelAddItem();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not add item' }),
    });
  }

  markComplete() {
    if (!this.checklist) return;
    this.saving = true;
    this.checklistsService.update(this.checklist.id, { status: 'completed' }).subscribe({
      next: (updated) => {
        this.checklist = updated;
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Completed!', detail: 'Checklist marked as complete' });
      },
      error: () => { this.saving = false; },
    });
  }
}

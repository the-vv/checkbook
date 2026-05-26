import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TemplatesService } from '../../../core/services/templates.service';
import { ChecklistsService } from '../../../core/services/checklists.service';
import { Template } from '../../../core/models';

@Component({
  selector: 'app-checklist-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <p-toast />

      <div class="flex items-center gap-3 mb-6">
        <button (click)="goBack()" class="text-slate-400 hover:text-white transition-colors">
          <i class="pi pi-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-white">New Checklist</h1>
          <p class="text-slate-400 mt-0.5">Start a new checklist from a template</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-white font-medium">Checklist Details</h3>

          <div class="flex flex-col gap-1">
            <label class="text-slate-300 text-sm font-medium">Template *</label>
            <p-dropdown [options]="templateOptions" formControlName="templateId"
              optionLabel="label" optionValue="value"
              placeholder="Choose a template"
              styleClass="w-full"
              (onChange)="onTemplateChange($event.value)" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-slate-300 text-sm font-medium">Title *</label>
            <input pInputText formControlName="title" placeholder="e.g. Sprint 12 Review, Q4 Audit"
              class="bg-slate-800 border-slate-700 text-white" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-slate-300 text-sm font-medium">Notes</label>
            <textarea pTextarea formControlName="notes" rows="3"
              placeholder="Any context or notes..."
              class="bg-slate-800 border-slate-700 text-white resize-none w-full"></textarea>
          </div>
        </div>

        <!-- Preview Items from Template -->
        @if (selectedTemplate) {
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-white font-medium">Checklist Items</h3>
                <p class="text-slate-400 text-xs mt-0.5">Items from template + any extras you add</p>
              </div>
              <p-button type="button" label="Add Extra Item" icon="pi pi-plus" size="small"
                severity="secondary" (onClick)="addExtraItem()" />
            </div>

            <!-- Template items (read-only preview) -->
            <div class="space-y-2 mb-4">
              @for (item of sortedTemplateItems; track item.id) {
                <div class="flex items-center gap-3 py-2 border-b border-slate-800">
                  <div class="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span class="text-slate-400 text-sm">{{ item.text }}</span>
                  <span class="text-slate-600 text-xs ml-auto">(from template)</span>
                </div>
              }
            </div>

            <!-- Extra items -->
            <div formArrayName="extraItems" class="space-y-2">
              @for (item of extraItemsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded border-2 border-violet-500 flex-shrink-0"></div>
                  <input pInputText formControlName="text" placeholder="Extra item..."
                    class="flex-1 bg-slate-800 border-slate-700 text-white text-sm" />
                  <button type="button" (click)="removeExtraItem(i)"
                    class="text-slate-500 hover:text-red-400 transition-colors p-1">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              }
            </div>

            @if (extraItemsArray.length > 0) {
              <p class="text-violet-400 text-xs mt-3">
                <i class="pi pi-info-circle mr-1"></i>
                {{ extraItemsArray.length }} extra item(s) will be added
              </p>
            }
          </div>
        }

        <div class="flex items-center gap-3 justify-end">
          <p-button type="button" label="Cancel" severity="secondary" [text]="true" (onClick)="goBack()" />
          <p-button type="submit" label="Create Checklist" icon="pi pi-check" [loading]="loading" />
        </div>
      </form>
    </div>
  `,
})
export class ChecklistFormComponent implements OnInit {
  form = this.fb.group({
    templateId: [null as number | null, Validators.required],
    title: ['', Validators.required],
    notes: [''],
    extraItems: this.fb.array([]),
  });
  loading = false;
  templates: Template[] = [];
  selectedTemplate: Template | null = null;
  templateOptions: { label: string; value: number }[] = [];

  get extraItemsArray() { return this.form.get('extraItems') as FormArray; }
  get sortedTemplateItems() {
    return [...(this.selectedTemplate?.items || [])].sort((a, b) => a.order - b.order);
  }

  constructor(
    private fb: FormBuilder,
    private templatesService: TemplatesService,
    private checklistsService: ChecklistsService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.templatesService.getAll().subscribe((t) => {
      this.templates = t;
      this.templateOptions = t.map((tpl) => ({ label: tpl.name, value: tpl.id }));
      const preselect = this.route.snapshot.queryParams['templateId'];
      if (preselect) {
        this.form.patchValue({ templateId: +preselect });
        this.onTemplateChange(+preselect);
      }
    });
  }

  onTemplateChange(id: number) {
    this.selectedTemplate = this.templates.find((t) => t.id === id) || null;
    this.extraItemsArray.clear();
  }

  addExtraItem() {
    this.extraItemsArray.push(this.fb.group({ text: ['', Validators.required] }));
  }

  removeExtraItem(i: number) {
    this.extraItemsArray.removeAt(i);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { templateId, title, notes, extraItems } = this.form.value;
    const extras = (extraItems as { text: string }[]).map((e) => ({ text: e.text }));

    this.checklistsService.create({ templateId: templateId!, title: title!, notes: notes || undefined, items: extras }).subscribe({
      next: (cl) => this.router.navigate(['/checklists', cl.id]),
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.message || 'Failed to create' });
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/checklists']);
  }
}

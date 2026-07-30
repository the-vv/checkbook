import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TemplatesService } from '../../../core/services/templates.service';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, MessageModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <p-toast />

      <div class="flex items-center gap-3 mb-6">
        <button (click)="goBack()" class="text-slate-400 hover:text-white transition-colors">
          <i class="pi pi-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-white">{{ editId ? 'Edit Template' : 'New Template' }}</h1>
          <p class="text-slate-400 mt-0.5">{{ editId ? 'Update template details' : 'Define your checklist structure' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 class="text-white font-medium">Template Details</h3>

          <div class="flex flex-col gap-1">
            <label class="text-slate-300 text-sm font-medium">Name *</label>
            <input pInputText formControlName="name" placeholder="e.g. Daily Standup, Project Checklist"
              class="bg-slate-800 border-slate-700 text-white" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-slate-300 text-sm font-medium">Description</label>
            <textarea pTextarea formControlName="description" rows="3"
              placeholder="What is this template for?"
              class="bg-slate-800 border-slate-700 text-white resize-none w-full"></textarea>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-medium">Checklist Items</h3>
            <p-button type="button" label="Add Item" icon="pi pi-plus" size="small" (onClick)="addItem()" />
          </div>

          <div formArrayName="items" class="space-y-2">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="flex items-center gap-2">
                <span class="text-slate-500 text-sm w-6 text-center">{{ i + 1 }}</span>
                <input pInputText formControlName="text" [placeholder]="'Item ' + (i + 1)"
                  class="flex-1 bg-slate-800 border-slate-700 text-white" />
                <button type="button" (click)="removeItem(i)"
                  class="text-slate-500 hover:text-red-400 transition-colors p-1">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            }
            @if (itemsArray.length === 0) {
              <p class="text-slate-500 text-sm text-center py-4">No items yet. Click "Add Item" to start.</p>
            }
          </div>
        </div>

        <div class="flex items-center gap-3 justify-end">
          <p-button type="button" label="Cancel" severity="secondary" [text]="true" (onClick)="goBack()" />
          <p-button type="submit" [label]="editId ? 'Save Changes' : 'Create Template'"
            icon="pi pi-check" [loading]="loading" />
        </div>
      </form>
    </div>
  `,
})
export class TemplateFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    items: this.fb.array([]),
  });
  loading = false;
  editId: number | null = null;

  get itemsArray() { return this.form.get('items') as FormArray; }

  constructor(
    private templatesService: TemplatesService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.editId = +id;
      this.loadTemplate(this.editId!);
    }
  }

  loadTemplate(id: number) {
    this.templatesService.getOne(id).subscribe((t) => {
      this.form.patchValue({ name: t.name, description: t.description });
      t.items.sort((a, b) => a.order - b.order).forEach((item) => this.addItem(item.text));
    });
  }

  addItem(text = '') {
    this.itemsArray.push(this.fb.group({ text: [text, Validators.required] }));
  }

  removeItem(i: number) {
    this.itemsArray.removeAt(i);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { name, description, items } = this.form.value;
    const payload = {
      name: name!,
      description: description || undefined,
      items: (items as { text: string }[]).map((item, idx) => ({ text: item.text, order: idx })),
    };

    const req = this.editId
      ? this.templatesService.update(this.editId, payload)
      : this.templatesService.create(payload);

    req.subscribe({
      next: (t) => this.router.navigate(['/templates', t.id]),
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.message || 'Failed to save' });
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate([this.editId ? `/templates/${this.editId}` : '/templates']);
  }
}

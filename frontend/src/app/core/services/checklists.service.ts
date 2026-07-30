import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChecklistInstance } from '../models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class ChecklistsService {
  constructor(private http: HttpClient) {}

  getAll(templateId?: number) {
    const url = templateId ? `${API}/checklists?templateId=${templateId}` : `${API}/checklists`;
    return this.http.get<ChecklistInstance[]>(url);
  }

  getOne(id: number) {
    return this.http.get<ChecklistInstance>(`${API}/checklists/${id}`);
  }

  create(data: {
    title: string;
    notes?: string;
    templateId: number;
    items?: { text: string; checked?: boolean; order?: number; templateItemId?: number }[];
  }) {
    return this.http.post<ChecklistInstance>(`${API}/checklists`, data);
  }

  update(id: number, data: {
    title?: string;
    notes?: string;
    status?: 'active' | 'completed';
    items?: { id?: number; text?: string; checked?: boolean; order?: number; templateItemId?: number }[];
  }) {
    return this.http.put<ChecklistInstance>(`${API}/checklists/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${API}/checklists/${id}`);
  }
}

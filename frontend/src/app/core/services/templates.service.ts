import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from '../models';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class TemplatesService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Template[]>(`${API}/templates`);
  }

  getOne(id: number) {
    return this.http.get<Template>(`${API}/templates/${id}`);
  }

  create(data: { name: string; description?: string; items?: { text: string; order?: number }[] }) {
    return this.http.post<Template>(`${API}/templates`, data);
  }

  update(id: number, data: { name?: string; description?: string; items?: { text: string; order?: number }[] }) {
    return this.http.put<Template>(`${API}/templates/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${API}/templates/${id}`);
  }
}

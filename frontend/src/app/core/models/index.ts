export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TemplateItem {
  id: number;
  text: string;
  order: number;
  templateId: number;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  userId: number;
  items: TemplateItem[];
  instances: ChecklistInstance[];
  createdAt: string;
  updatedAt: string;
}

export interface InstanceItem {
  id: number;
  text: string;
  checked: boolean;
  order: number;
  templateItemId?: number;
  instanceId: number;
}

export type ChecklistStatus = 'active' | 'completed';

export interface ChecklistInstance {
  id: number;
  title: string;
  notes: string;
  status: ChecklistStatus;
  userId: number;
  templateId: number;
  template: Template;
  items: InstanceItem[];
  createdAt: string;
  updatedAt: string;
}

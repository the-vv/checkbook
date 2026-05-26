import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Template } from '../templates/template.entity';
import { ChecklistInstance } from '../checklists/checklist-instance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Template, (t) => t.user)
  templates: Template[];

  @OneToMany(() => ChecklistInstance, (c) => c.user)
  checklistInstances: ChecklistInstance[];
}

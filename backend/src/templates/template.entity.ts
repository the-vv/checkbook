import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { TemplateItem } from './template-item.entity';
import { ChecklistInstance } from '../checklists/checklist-instance.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.templates)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => TemplateItem, (i) => i.template, { cascade: true })
  items: TemplateItem[];

  @OneToMany(() => ChecklistInstance, (c) => c.template)
  instances: ChecklistInstance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

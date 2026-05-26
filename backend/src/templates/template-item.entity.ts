import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Template } from './template.entity';

@Entity('template_items')
export class TemplateItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  templateId: number;

  @ManyToOne(() => Template, (t) => t.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: Template;
}

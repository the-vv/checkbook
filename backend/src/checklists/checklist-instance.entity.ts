import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Template } from '../templates/template.entity';
import { InstanceItem } from './instance-item.entity';

export enum ChecklistStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('checklist_instances')
export class ChecklistInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'varchar', default: ChecklistStatus.ACTIVE })
  status: ChecklistStatus;

  @Column()
  userId: number;

  @Column()
  templateId: number;

  @ManyToOne(() => User, (u) => u.checklistInstances)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Template, (t) => t.instances)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @OneToMany(() => InstanceItem, (i) => i.instance, { cascade: true })
  items: InstanceItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

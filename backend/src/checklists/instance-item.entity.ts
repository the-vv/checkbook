import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChecklistInstance } from './checklist-instance.entity';

@Entity('instance_items')
export class InstanceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: false })
  checked: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  templateItemId: number;

  @Column()
  instanceId: number;

  @ManyToOne(() => ChecklistInstance, (i) => i.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instanceId' })
  instance: ChecklistInstance;
}

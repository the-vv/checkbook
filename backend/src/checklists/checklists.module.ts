import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistInstance } from './checklist-instance.entity';
import { InstanceItem } from './instance-item.entity';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistInstance, InstanceItem]), TemplatesModule],
  providers: [ChecklistsService],
  controllers: [ChecklistsController],
})
export class ChecklistsModule {}

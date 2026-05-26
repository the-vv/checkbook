import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistInstance } from './checklist-instance.entity';
import { InstanceItem } from './instance-item.entity';
import { CreateChecklistInstanceDto, UpdateChecklistInstanceDto } from './checklists.dto';
import { TemplatesService } from '../templates/templates.service';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectRepository(ChecklistInstance) private instanceRepo: Repository<ChecklistInstance>,
    @InjectRepository(InstanceItem) private itemRepo: Repository<InstanceItem>,
    private templatesService: TemplatesService,
  ) {}

  async findAll(userId: number): Promise<ChecklistInstance[]> {
    return this.instanceRepo.find({
      where: { userId },
      relations: { template: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTemplate(templateId: number, userId: number): Promise<ChecklistInstance[]> {
    return this.instanceRepo.find({
      where: { templateId, userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<ChecklistInstance> {
    const instance = await this.instanceRepo.findOne({
      where: { id },
      relations: { template: { items: true }, items: true },
    });
    if (!instance) throw new NotFoundException('Checklist not found');
    if (instance.userId !== userId) throw new ForbiddenException();
    return instance;
  }

  async create(dto: CreateChecklistInstanceDto, userId: number): Promise<ChecklistInstance> {
    const template = await this.templatesService.findOne(dto.templateId, userId);
    const instance = this.instanceRepo.create({
      title: dto.title,
      notes: dto.notes,
      templateId: dto.templateId,
      userId,
    });
    const saved = await this.instanceRepo.save(instance);

    const baseItems = template.items.map((ti, idx) =>
      this.itemRepo.create({
        text: ti.text,
        checked: false,
        order: ti.order ?? idx,
        templateItemId: ti.id,
        instanceId: saved.id,
      }),
    );

    const extraItems = (dto.items || [])
      .filter((i) => !i.templateItemId)
      .map((item, idx) =>
        this.itemRepo.create({
          text: item.text,
          checked: item.checked ?? false,
          order: baseItems.length + idx,
          instanceId: saved.id,
        }),
      );

    await this.itemRepo.save([...baseItems, ...extraItems]);
    return this.findOne(saved.id, userId);
  }

  async update(id: number, dto: UpdateChecklistInstanceDto, userId: number): Promise<ChecklistInstance> {
    const instance = await this.findOne(id, userId);
    if (dto.title !== undefined) instance.title = dto.title;
    if (dto.notes !== undefined) instance.notes = dto.notes;
    if (dto.status !== undefined) instance.status = dto.status;
    await this.instanceRepo.save(instance);

    if (dto.items !== undefined) {
      await this.itemRepo.delete({ instanceId: id });
      if (dto.items.length) {
        const items = dto.items.map((item, idx) =>
          this.itemRepo.create({
            text: item.text ?? '',
            checked: item.checked ?? false,
            order: item.order ?? idx,
            templateItemId: item.templateItemId,
            instanceId: id,
          }),
        );
        await this.itemRepo.save(items);
      }
    }
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const instance = await this.findOne(id, userId);
    await this.instanceRepo.remove(instance);
  }
}

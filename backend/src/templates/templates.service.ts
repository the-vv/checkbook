import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { TemplateItem } from './template-item.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './templates.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template) private templateRepo: Repository<Template>,
    @InjectRepository(TemplateItem) private itemRepo: Repository<TemplateItem>,
  ) {}

  async findAll(userId: number): Promise<Template[]> {
    return this.templateRepo.find({
      where: { userId },
      relations: { items: true, instances: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Template> {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: { items: true, instances: true },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.userId !== userId) throw new ForbiddenException();
    return template;
  }

  async create(dto: CreateTemplateDto, userId: number): Promise<Template> {
    const template = this.templateRepo.create({ name: dto.name, description: dto.description, userId });
    const saved = await this.templateRepo.save(template);
    if (dto.items?.length) {
      const items = dto.items.map((item, idx) =>
        this.itemRepo.create({ text: item.text, order: item.order ?? idx, templateId: saved.id }),
      );
      await this.itemRepo.save(items);
    }
    return this.findOne(saved.id, userId);
  }

  async update(id: number, dto: UpdateTemplateDto, userId: number): Promise<Template> {
    const template = await this.findOne(id, userId);
    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    await this.templateRepo.save(template);
    if (dto.items !== undefined) {
      await this.itemRepo.delete({ templateId: id });
      if (dto.items.length) {
        const items = dto.items.map((item, idx) =>
          this.itemRepo.create({ text: item.text, order: item.order ?? idx, templateId: id }),
        );
        await this.itemRepo.save(items);
      }
    }
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const template = await this.findOne(id, userId);
    await this.templateRepo.remove(template);
  }
}

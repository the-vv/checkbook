import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistInstanceDto, UpdateChecklistInstanceDto } from './checklists.dto';

@Controller('checklists')
@UseGuards(AuthGuard('jwt'))
export class ChecklistsController {
  constructor(private checklistsService: ChecklistsService) {}

  @Get()
  findAll(@Request() req, @Query('templateId') templateId?: string) {
    if (templateId) {
      return this.checklistsService.findByTemplate(+templateId, req.user.id);
    }
    return this.checklistsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.checklistsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body(ValidationPipe) dto: CreateChecklistInstanceDto, @Request() req) {
    return this.checklistsService.create(dto, req.user.id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateChecklistInstanceDto, @Request() req) {
    return this.checklistsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.checklistsService.remove(id, req.user.id);
  }
}

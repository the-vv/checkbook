import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './templates.dto';

@Controller('templates')
@UseGuards(AuthGuard('jwt'))
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  findAll(@Request() req) {
    return this.templatesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.templatesService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body(ValidationPipe) dto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(dto, req.user.id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateTemplateDto, @Request() req) {
    return this.templatesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.templatesService.remove(id, req.user.id);
  }
}

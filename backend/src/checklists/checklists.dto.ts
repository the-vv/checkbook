import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistStatus } from './checklist-instance.entity';

export class CreateInstanceItemDto {
  @IsString()
  text: string;

  @IsBoolean()
  @IsOptional()
  checked?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  templateItemId?: number;
}

export class CreateChecklistInstanceDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  templateId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstanceItemDto)
  @IsOptional()
  items?: CreateInstanceItemDto[];
}

export class UpdateInstanceItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  checked?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsOptional()
  templateItemId?: number;
}

export class UpdateChecklistInstanceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ChecklistStatus)
  @IsOptional()
  status?: ChecklistStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInstanceItemDto)
  @IsOptional()
  items?: UpdateInstanceItemDto[];
}

import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateItemDto {
  @IsString()
  text: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateItemDto)
  @IsOptional()
  items?: CreateTemplateItemDto[];
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateItemDto)
  @IsOptional()
  items?: CreateTemplateItemDto[];
}

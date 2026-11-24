import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { BaseFilterDto } from '../../../common/dto/base-filter.dto';

export class BrandFilterDto extends BaseFilterDto { 
  @ApiPropertyOptional({ description: 'شناسه دسته‌بندی' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'فعال' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
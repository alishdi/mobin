import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class BaseFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'مرتب‌سازی بر اساس فیلد' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminPaginationDto } from '../../../common/dto/admin-pagination.dto'; 

export class ProductFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ enum: ['true', 'false'], description: 'فیلتر فعال/غیرفعال' })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({ description: 'تاریخ شروع (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional({ description: 'تاریخ پایان (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;
}
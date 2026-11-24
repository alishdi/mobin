import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { BaseFilterDto } from '../../../common/dto/base-filter.dto'; 

export class InstallmentFilterDto extends BaseFilterDto { 
  @ApiPropertyOptional({ description: 'شناسه مدل' })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ description: 'شناسه خودرو' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'شناسه برند' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'حداقل مدت (ماه)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  minDuration?: number;

  @ApiPropertyOptional({ description: 'حداکثر مدت (ماه)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'حداقل مبلغ قسط ماهانه' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minMonthlyAmount?: number;

  @ApiPropertyOptional({ description: 'حداکثر مبلغ قسط ماهانه' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxMonthlyAmount?: number;

  @ApiPropertyOptional({ description: 'طرح ویژه' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHighlighted?: boolean;

  @ApiPropertyOptional({ description: 'فعال' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
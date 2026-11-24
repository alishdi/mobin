import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { BaseFilterDto, SortOrder } from '../../../common/dto/base-filter.dto'

export enum VehicleSortField {
  ORDER = 'order',
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  VIEW_COUNT = 'viewCount',
}

export class VehicleFilterDto extends BaseFilterDto { // ✅ تغییر
  @ApiPropertyOptional({ description: 'شناسه دسته‌بندی (داخلی/وارداتی)' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'شناسه برند' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'شناسه مدل' })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ description: 'حداقل قیمت کل' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'حداکثر قیمت کل' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

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

  @ApiPropertyOptional({ description: 'سال تولید' })
  @IsOptional()
  @IsNumber()
  @Min(1380)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: 'پیشنهاد ویژه' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'فعال' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'تاریخ شروع (برای فیلتر createdAt)' })
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'تاریخ پایان (برای فیلتر createdAt)' })
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;

  // ✅ sortBy و sortOrder از BaseFilterDto می‌آید
  // اگر می‌خواهی مقادیر enum محدود باشد، اینجا override کن:
  @ApiPropertyOptional({ enum: VehicleSortField, default: 'order' })
  @IsOptional()
  @IsEnum(VehicleSortField)
  sortBy?: VehicleSortField = 'order' as any;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
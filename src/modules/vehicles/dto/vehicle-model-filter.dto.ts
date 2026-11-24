import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { BaseFilterDto } from '../../../common/dto/base-filter.dto'; 

export class ModelFilterDto extends BaseFilterDto { 
  @ApiPropertyOptional({ description: 'شناسه خودرو' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'شناسه برند' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

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
}
import { IsNumber, IsBoolean, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInstallmentPlanDto {
  @ApiProperty({ description: 'شناسه مدل خودرو (Vehicle Model ID)' })
  @IsString()
  modelId: string;

  @ApiProperty({ description: 'مدت زمان به ماه' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMonths: number;

  @ApiProperty({ description: 'مبلغ هر قسط' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyAmount: number;

  @ApiProperty({ description: 'مجموع مبلغ اقساط' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalInstallments: number;

  @ApiPropertyOptional({ description: 'آیا این طرح برجسته (ویژه) است؟', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHighlighted?: boolean;

  @ApiPropertyOptional({ description: 'ترتیب نمایش' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ description: 'فعال یا غیرفعال', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
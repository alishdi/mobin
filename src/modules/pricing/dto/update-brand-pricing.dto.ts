import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstallmentPlanUpdateDto {
  @ApiProperty({ description: 'مدت اقساط به ماه (مثلاً 12, 24, 36, 48, 60, 72)' })
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

  @ApiProperty({ description: 'مبلغ پیش‌پرداخت اول (همزمان با تحویل)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  firstDownPayment: number;

  @ApiProperty({ description: 'قیمت کل خودرو در این طرح' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalPrice: number;

  @ApiPropertyOptional({ description: 'آیا این طرح ویژه است؟ (فقط یک طرح در هر مدل می‌تواند ویژه باشد)', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isHighlighted?: boolean;
}

export class VehicleModelPricingDto {
  @ApiProperty({ description: 'اسلاگ خودرو (مثلاً tara)' })
  @IsString()
  vehicleSlug: string;

  @ApiProperty({ description: 'اسلاگ مدل (مثلاً tara-automatic-v4)' })
  @IsString()
  modelSlug: string;

  @ApiPropertyOptional({ description: 'سال تولید' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: 'کارکرد' })
  @IsOptional()
  @IsString()
  mileage?: string;

  @ApiProperty({ type: [InstallmentPlanUpdateDto], description: 'لیست طرح‌های اقساطی' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentPlanUpdateDto)
  plans: InstallmentPlanUpdateDto[];
}

export class UpdateBrandPricingDto {
  @ApiProperty({ description: 'اسلاگ برند (مثلاً iran-khodro)' })
  @IsString()
  brandSlug: string;

  @ApiProperty({ type: [VehicleModelPricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleModelPricingDto)
  vehicles: VehicleModelPricingDto[];
}
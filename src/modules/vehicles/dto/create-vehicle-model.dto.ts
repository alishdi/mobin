import {
  IsString, IsOptional, IsInt, IsBoolean, IsNumber, Min, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '../../../common/decorators/boolean-transform.decorator';

export class CreateVehicleModelDto {
  @ApiProperty({ example: 'اتوماتیک V4' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'tara-automatic-v4' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug فقط حروف کوچک، عدد و خط تیره' })
  slug: string;

  @ApiPropertyOptional({ example: 1405 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1300)
  year?: number;

  @ApiPropertyOptional({ example: 'صفر کیلومتر' })
  @IsOptional()
  @IsString()
  mileage?: string;

  @ApiProperty({ example: 1487200000, description: 'پیش پرداخت اول' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  firstDownPayment: number;

  @ApiPropertyOptional({ example: 2139400000, description: 'پیش پرداخت دوم ۲ ماهه' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  secondDownPayment2Months?: number;

  @ApiPropertyOptional({ example: 2139400000, description: 'پیش پرداخت دوم ۷ ماهه' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  secondDownPayment7Months?: number;

  @ApiPropertyOptional({ example: 1500000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({ example: '/assets/models/tara-v4.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true, enum: ['true', 'false'] })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, enum: ['true', 'false'] })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isFeatured?: boolean;
}
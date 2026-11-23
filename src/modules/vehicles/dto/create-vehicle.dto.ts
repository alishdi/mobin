import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '../../../common/decorators/boolean-transform.decorator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'تارا' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'tara', description: 'فقط حروف کوچک انگلیسی، عدد و خط تیره' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug فقط مجاز به حروف کوچک انگلیسی، عدد و خط تیره است',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'تارا، خودروی مدرن ایران خودرو با طراحی زیبا' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/assets/vehicles/tara.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'گالری تصاویر به صورت JSON رشته‌ای',
    example: '["/img/tara-1.jpg","/img/tara-2.jpg"]',
  })
  @IsOptional()
  @IsString()
  gallery?: string;

  @ApiPropertyOptional({
    description: 'ویژگی‌ها به صورت JSON رشته‌ای',
    example: '["سانروف","صندلی برقی","دوربین ۳۶۰"]',
  })
  @IsOptional()
  @IsString()
  features?: string;

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
import { IsString, IsOptional, IsInt, IsBoolean, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '../../../common/decorators/boolean-transform.decorator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'خودروهای داخلی' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'domestic', description: 'فقط حروف انگلیسی کوچک و خط تیره' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug فقط مجاز به حروف کوچک انگلیسی، عدد و خط تیره است' })
  slug: string;

  @ApiPropertyOptional({ example: 'بهترین برندهای خودروی داخلی' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/assets/categories/domestic.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'car-domestic' })
  @IsOptional()
  @IsString()
  icon?: string;

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
}
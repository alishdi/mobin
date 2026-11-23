import { IsString, IsOptional, IsInt, IsBoolean, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from '../../../common/decorators/boolean-transform.decorator';

export class CreateBrandDto {
  @ApiProperty({ example: 'ایران خودرو' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'iran-khodro' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug فقط مجاز به حروف کوچک انگلیسی، عدد و خط تیره است' })
  slug: string;

  @ApiPropertyOptional({ example: '/assets/brands/iran-khodro.svg' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'بزرگترین خودروساز داخلی' })
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
}
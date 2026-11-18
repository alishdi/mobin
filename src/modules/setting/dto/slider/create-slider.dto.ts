import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from 'src/common/decorators/boolean-transform.decorator'; 

export class CreateSliderDto {
  @ApiProperty({ example: 'تخفیف ویژه عید', type: String })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'تا ۳۰٪ تخفیف روی تمام خودروها', type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/slider1.jpg', type: String })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: '/offers', type: String })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 'مشاهده پیشنهادات', type: String })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({ example: 'home', type: String })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z', type: String })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z', type: String })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true, type: String, enum: ['true', 'false'] })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
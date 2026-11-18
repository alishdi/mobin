import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from 'src/common/decorators/boolean-transform.decorator'; 

export class CreateSubmenuDto {
  @ApiProperty({ example: 'خودروهای داخلی', type: String })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '/vehicles/domestic', type: String })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'car-icon', type: String })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true, type: String, enum: ['true', 'false'] })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, type: String, enum: ['true', 'false'] })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  openInNewTab?: boolean;
}
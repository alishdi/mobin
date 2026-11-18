import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToBoolean } from 'src/common/decorators/boolean-transform.decorator'; 

export enum FooterSection {
  ABOUT = 'about',
  LINKS = 'links',
  CONTACT = 'contact',
  SOCIAL = 'social',
}

export class CreateFooterDto {
  @ApiProperty({ example: 'about', enum: FooterSection, type: String })
  @IsEnum(FooterSection)
  section: FooterSection;

  @ApiProperty({ example: 'درباره ما', type: String })
  @IsString()
  title: string;

  @ApiProperty({ example: '{"text": "مبین خودرو، فروش اقساطی خودرو"}', type: String })
  @IsString()
  content: string;

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
}
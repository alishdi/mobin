import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FooterSection } from '../../../../database/entities/footer/footer.entity'; 
import { ToBoolean } from '../../../../common/decorators/boolean-transform.decorator'

export class CreateFooterDto {
  @ApiProperty({ enum: FooterSection, type: String })
  @IsEnum(FooterSection)
  section: FooterSection;

  @ApiProperty({ example: 'معرفی مبین خودرو' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'محتوای بخش به صورت JSON رشته‌ای',
    example: '{"logoUrl":"...","slogan":"خیابان‌های شهر منتظرن!"}',
  })
  @IsString()
  content: string; // JSON string

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
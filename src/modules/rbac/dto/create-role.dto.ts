import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '../../../database/entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({ 
    description: 'نام نقش',
    example: 'admin',
    enum: RoleName,
    type: String
  })
  @IsEnum(RoleName)
  name: RoleName;

  @ApiProperty({ 
    description: 'عنوان نمایشی',
    example: 'مدیر سیستم',
    type: String
  })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ 
    description: 'توضیحات',
    example: 'دسترسی به تمام بخش‌ها',
    type: String
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'آیا فعال است؟',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'آیدی دسترسی‌ها (JSON Array)',
    example: '["uuid-1","uuid-2"]',
    type: String
  })
  @IsOptional()
  @IsString()
  permissionIds?: string; 
}
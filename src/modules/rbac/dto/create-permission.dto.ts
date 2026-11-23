import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionResource, PermissionAction } from '../../../database/entities/role-permission/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ 
    description: 'منبع دسترسی',
    example: 'users',
    enum: PermissionResource,
    type: String
  })
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @ApiProperty({ 
    description: 'اکشن دسترسی',
    example: 'create',
    enum: PermissionAction,
    type: String
  })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiProperty({ 
    description: 'کد یکتای دسترسی',
    example: 'users:create',
    type: String
  })
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'عنوان نمایشی',
    example: 'ایجاد کاربر',
    type: String
  })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ 
    description: 'توضیحات',
    example: 'امکان ثبت کاربر جدید',
    type: String
  })
  @IsOptional()
  @IsString()
  description?: string;
}
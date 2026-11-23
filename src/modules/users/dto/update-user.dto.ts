import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: '09129420221', description: 'شماره موبایل (اجباری)' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید ۱۱ رقم و با 09 شروع شود' })
  phone: string;

  @ApiPropertyOptional({ example: 'علی' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'شهیدی' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'فرمت ایمیل صحیح نیست' })
  email?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'کد ملی باید دقیقاً ۱۰ رقم باشد' })
  nationalCode?: string;

  @ApiPropertyOptional({ example: true, description: 'فعال یا غیرفعال کردن کاربر' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true, description: 'تأیید شده یا نه' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'آرایه‌ای از ID نقش‌ها (Roles) برای تخصیص به کاربر',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
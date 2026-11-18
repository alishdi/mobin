import { IsString, IsNotEmpty, MinLength, IsOptional, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: '09129420221',
    description: 'شماره موبایل (اجباری)',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ 
    example: 'App76012@',
    description: 'رمز عبور (حداقل ۶ کاراکتر)',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    example: 'علی',
    description: 'نام',
    type: String
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ 
    example: 'محمدی',
    description: 'نام خانوادگی',
    type: String
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ 
    example: 'ali@example.com',
    description: 'ایمیل',
    type: String
  })
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ 
    example: '0012345678',
    description: 'کد ملی',
    type: String
  })
  @IsString()
  @IsOptional()
  nationalCode?: string;

  @ApiPropertyOptional({ 
    example: 'https://example.com/avatar.jpg',
    description: 'لینک آواتار',
    type: String
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
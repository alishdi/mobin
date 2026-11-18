import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: '09120000000',
    description: 'شماره موبایل کاربر',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ 
    example: 'Admin@12345',
    description: 'رمز عبور کاربر',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
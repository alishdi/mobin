import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ 
    description: 'مقدار جدید تنظیم',
    example: 'https://example.com/logo.png',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}
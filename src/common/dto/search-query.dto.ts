import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiPropertyOptional({ 
    example: 'تارا', 
    description: 'متن جستجو (حداقل ۲ کاراکتر)' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInstallmentPlanDto } from './create-installment-plan.dto';

export class BulkCreateInstallmentPlansDto {
  @ApiProperty({
    type: [CreateInstallmentPlanDto],
    description: 'آرایه پلن‌های اقساط (حداکثر ۶ ردیف: ۱۲، ۲۴، ۳۶، ۴۸، ۶۰، ۷۲ ماه)',
    example: [
      { durationMonths: 12, monthlyAmount: 219170000 },
      { durationMonths: 24, monthlyAmount: 1200510000 },
      { durationMonths: 36, monthlyAmount: 87920000 },
      { durationMonths: 48, monthlyAmount: 71990000 },
      { durationMonths: 60, monthlyAmount: 62680000, isHighlighted: true },
      { durationMonths: 72, monthlyAmount: 55130000 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentPlanDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  plans: CreateInstallmentPlanDto[];
}
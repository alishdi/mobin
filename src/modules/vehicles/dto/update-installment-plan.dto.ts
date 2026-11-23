import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentPlanDto } from './create-installment-plan.dto';
export class UpdateInstallmentPlanDto extends PartialType(CreateInstallmentPlanDto) {}
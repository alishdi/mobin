import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehicleController } from './vehicle.controller'; 
import { VehicleService } from './vehicle.service';
import { VehicleModelController } from './vehicle-model.controller';
import { VehicleModelService } from './vehicle-model.service';
import { InstallmentPlanController } from './installment-plan.controller';
import { InstallmentPlanService } from './installment-plan.service';

import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';
import { Brand } from '../../database/entities/product/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleModel, InstallmentPlan, Brand])],
  controllers: [
    VehicleController,
    VehicleModelController,
    InstallmentPlanController,
  ],
  providers: [VehicleService, VehicleModelService, InstallmentPlanService],
  exports: [VehicleService, VehicleModelService, InstallmentPlanService],
})
export class VehiclesModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { ApiKeyGuard } from './guards/api-key.guard'; 
import { ApiClient } from '../../database/entities/api-client/api-client.entity'; 
import { Brand } from '../../database/entities/product/brand.entity';
import { CacheClearService } from '../../common/services/cache-clear.service'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiClient, Brand]),
  ],
  controllers: [PricingController],
  providers: [PricingService, ApiKeyGuard, CacheClearService],
})
export class PricingModule {}
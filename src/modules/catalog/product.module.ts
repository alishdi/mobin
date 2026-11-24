import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './product.controller'; 
import { ProductService } from './product.service';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

import { Product } from '../../database/entities/product/product.entity';
import { Brand } from '../../database/entities/product/brand.entity';
import { AdminProductController } from './admin-product.controller';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand,Vehicle])],
  controllers: [ProductController,AdminProductController, BrandController],
  providers: [ProductService, BrandService],
  exports: [ProductService, BrandService],
})
export class CatalogModule {}
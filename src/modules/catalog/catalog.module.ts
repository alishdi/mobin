import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

import { Category } from '../../database/entities/category/category.entity';
import { Brand } from '../../database/entities/category/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand])],
  controllers: [CategoryController, BrandController],
  providers: [CategoryService, BrandService],
  exports: [CategoryService, BrandService],
})
export class CatalogModule {}
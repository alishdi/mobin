import {
  Controller, Get, Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Public } from '../../common/decorators/public.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Product } from '../../database/entities/product/product.entity'; 

@ApiTags('دسته‌بندی‌ها - عمومی (Products Public)')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست دسته‌بندی‌ها (فرانت‌اند)' })
  @UseInterceptors(CacheInterceptor)
  findActiveList(): Promise<Partial<Product>[]> {
    return this.productService.findActiveList();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'جزئیات یک دسته‌بندی' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productService.findBySlug(slug);
  }
}
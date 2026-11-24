import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Product } from '../../database/entities/product/product.entity'; 
@ApiTags('پنل مدیریت - دسته‌بندی‌ها (Admin Products)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/products') 
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست دسته‌بندی‌ها (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiPaginatedResponse(Product)
  @UseInterceptors(CacheInterceptor)
  findAll(@Query() q: AdminPaginationDto & { isActive?: boolean }): Promise<PaginatedResponseDto<Product>> {
    return this.productService.findAllForAdmin(q);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک دسته‌بندی' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ایجاد دسته‌بندی' })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productService.create(dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ویرایش دسته‌بندی' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف دسته‌بندی' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.remove(id);
  }
}
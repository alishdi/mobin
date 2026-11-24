import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandFilterDto } from './dto/brand-filter.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Brand } from '../../database/entities/product/brand.entity';

@ApiTags('برندها (Brands)')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }


  @Public()
  @Get('product/:slug')
  @ApiOperation({ summary: 'برندهای یک دسته‌بندی' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiPaginatedResponse(Brand)
  @UseInterceptors(CacheInterceptor)
  findActiveByProduct(@Param('slug') slug: string, @Query() filter: BrandFilterDto): Promise<PaginatedResponseDto<Brand>> {
    return this.brandService.findActiveByProductSlug(slug, filter);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'صفحه کامل برند (همه خودروها + مدل‌ها + جدول اقساط)' })
  @ApiParam({ name: 'slug', description: 'اسلاگ برند (مثلاً iran-khodro)' })
  @ApiOkResponse({ description: 'داده‌های کامل برند با موفقیت دریافت شد' })
  @UseInterceptors(CacheInterceptor)
  findBrandPage(@Param('slug') slug: string) {
    return this.brandService.findBrandPage(slug);
  }
  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک برند' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string): Promise<Brand> {
    return this.brandService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست برندها (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Brand)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto): Promise<PaginatedResponseDto<Brand>> {
    return this.brandService.findAllForAdmin(q);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک برند' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Brand> {
    return this.brandService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ایجاد برند' })
  create(@Body() dto: CreateBrandDto & { productId: string }): Promise<Brand> {
    return this.brandService.create(dto.productId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ویرایش برند' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto): Promise<Brand> {
    return this.brandService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف برند' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.brandService.remove(id);
  }
}
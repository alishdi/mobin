import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Brand } from '../../database/entities/category/brand.entity';

@ApiTags('برندها (Brands)')
@Controller()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Public()
  @Get('categories/:slug/brands')
  @ApiOperation({ summary: 'برندهای یک دسته‌بندی' })
  @UseInterceptors(CacheInterceptor)
  findBrandsByCategory(@Param('slug') slug: string, @Query() q: AdminPaginationDto) {
    return this.brandService.findActiveByCategorySlug(slug, q);
  }

  @Public()
  @Get('brands/slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک برند' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/brands')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست برندها (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Brand)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.brandService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/brands/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک برند' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.brandService.findOne(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('categories/:categoryId/brands')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ایجاد برند' })
  create(@Param('categoryId') categoryId: string, @Body() dto: CreateBrandDto) {
    return this.brandService.create(categoryId, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('brands/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ویرایش برند' })
  update(@Param('id',ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('brands/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف برند' })
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.brandService.remove(id);
  }
}
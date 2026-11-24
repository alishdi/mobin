import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';

@ApiTags('خودروها (Vehicles)')
@Controller()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // ==================== Public ====================

  @Public()
  @Get('brands/:brandSlug/vehicles')
  @ApiOperation({ summary: 'خودروهای یک برند با فیلترهای کامل' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minMonthlyAmount', required: false })
  @ApiQuery({ name: 'maxMonthlyAmount', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(Vehicle)
  @UseInterceptors(CacheInterceptor)
  findVehiclesByBrand(
    @Param('brandSlug') brandSlug: string,
    @Query() filter: VehicleFilterDto,
  ): Promise<PaginatedResponseDto<Vehicle>> {
    return this.vehicleService.findActiveByBrandSlug(brandSlug, filter);
  }

  @Public()
  @Get('vehicles/slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک خودرو' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string): Promise<Vehicle> {
    return this.vehicleService.findBySlug(slug);
  }

  @Public()
  @Get('vehicles/featured')
  @ApiOperation({ summary: 'خودروهای پیشنهاد ویژه' })
  @UseInterceptors(CacheInterceptor)
  findFeatured(@Query('limit') limit?: number): Promise<Partial<Vehicle>[]> {
    return this.vehicleService.findFeatured(limit || 8);
  }

  @Public()
  @Get('vehicles/search')
  @ApiOperation({ summary: 'جستجوی خودرو' })
  @UseInterceptors(CacheInterceptor)
  search(@Query('q') query: string, @Query('limit') limit?: number): Promise<Partial<Vehicle>[]> {
    return this.vehicleService.search(query, limit || 10);
  }

  // ==================== Admin ====================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicles')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست خودروها با فیلترهای کامل (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'modelId', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minMonthlyAmount', required: false })
  @ApiQuery({ name: 'maxMonthlyAmount', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(Vehicle)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: VehicleFilterDto): Promise<PaginatedResponseDto<Vehicle>> {
    return this.vehicleService.findAllForAdmin(q);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'جزئیات یک خودرو' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vehicle> {
    return this.vehicleService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('brands/:brandId/vehicles')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ایجاد خودرو' })
  create(@Param('brandId', ParseUUIDPipe) brandId: string, @Body() dto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.create(brandId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('vehicles/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش خودرو' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('vehicles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف خودرو' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vehicleService.remove(id);
  }
}
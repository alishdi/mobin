import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('خودروها (Vehicles)')
@Controller()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) { }

  @Public()
  @Get('brands/:brandSlug/vehicles')
  @ApiOperation({ summary: 'خودروهای یک برند' })
  @UseInterceptors(CacheInterceptor)
  findVehiclesByBrand(@Param('brandSlug') brandSlug: string, @Query() filter: VehicleFilterDto) {
    return this.vehicleService.findActiveByBrandSlug(brandSlug, filter);
  }

  @Public()
  @Get('vehicles/slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک خودرو' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string) {
    return this.vehicleService.findBySlug(slug);
  }

  @Public()
  @Get('vehicles/featured')
  @ApiOperation({ summary: 'خودروهای پیشنهاد ویژه' })
  @UseInterceptors(CacheInterceptor)
  findFeatured(@Query() q: PaginationQueryDto) {
    return this.vehicleService.findFeatured(q);
  }

  @Public()
  @Get('vehicles/search')
  @ApiOperation({ summary: 'جستجوی خودرو' })
  @UseInterceptors(CacheInterceptor)
  search(@Query() q: PaginationQueryDto & { query?: string }) {
    return this.vehicleService.search(q);
  }


  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicles')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست خودروها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Vehicle)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.vehicleService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'جزئیات یک خودرو' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('brands/:brandId/vehicles')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ایجاد خودرو' })
  create(@Param('brandId') brandId: string, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(brandId, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('vehicles/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش خودرو' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('vehicles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف خودرو' })
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleModelService } from './vehicle-model.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dto/update-vehicle-model.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';

@ApiTags('مدل‌های خودرو (Vehicle Models)')
@Controller()
export class VehicleModelController {
  constructor(private readonly modelService: VehicleModelService) {}

  // ==================== Public ====================

  // ✅ مسیر ۱: دریافت مدل‌های یک خودرو (با slug خودرو)
  @Public()
  @Get('vehicles/slug/:vehicleSlug/models')
  @ApiOperation({ summary: 'مدل‌های یک خودرو' })
  @UseInterceptors(CacheInterceptor)
  findModelsByVehicle(
    @Param('vehicleSlug') vehicleSlug: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.modelService.findActiveByVehicleSlug(vehicleSlug, q);
  }

  // ✅ مسیر ۲: دریافت جزئیات یک مدل خاص (با slug مدل)
  @Public()
  @Get('vehicle-models/slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک مدل با جدول اقساط' })
  @UseInterceptors(CacheInterceptor)
  findWithPlans(@Param('slug') slug: string) {
    return this.modelService.findWithPlans(slug);
  }

  // ==================== Admin ====================

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicle-models')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست مدل‌ها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(VehicleModel)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.modelService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicle-models/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'جزئیات یک مدل' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.modelService.findOne(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('vehicles/:vehicleId/models')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ایجاد مدل' })
  create(@Param('vehicleId') vehicleId: string, @Body() dto: CreateVehicleModelDto) {
    return this.modelService.create(vehicleId, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('vehicle-models/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش مدل' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleModelDto) {
    return this.modelService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('vehicle-models/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف مدل' })
  remove(@Param('id') id: string) {
    return this.modelService.remove(id);
  }
}
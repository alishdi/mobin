import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { VehicleModelService } from './vehicle-model.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dto/update-vehicle-model.dto';
import { ModelFilterDto } from './dto/vehicle-model-filter.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';

@ApiTags('مدل‌های خودرو (Vehicle Models)')
@Controller()
export class VehicleModelController {
  constructor(private readonly modelService: VehicleModelService) {}

  @Public()
  @Get('vehicles/slug/:vehicleSlug/models')
  @ApiOperation({ summary: 'مدل‌های یک خودرو با فیلترهای کامل' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiPaginatedResponse(VehicleModel)
  @UseInterceptors(CacheInterceptor)
  findModelsByVehicle(
    @Param('vehicleSlug') vehicleSlug: string,
    @Query() filter: ModelFilterDto,
  ): Promise<PaginatedResponseDto<VehicleModel>> {
    return this.modelService.findActiveByVehicleSlug(vehicleSlug, filter);
  }

  @Public()
  @Get('vehicle-models/slug/:slug')
  @ApiOperation({ summary: 'جزئیات یک مدل با جدول اقساط' })
  @UseInterceptors(CacheInterceptor)
  findWithPlans(@Param('slug') slug: string): Promise<VehicleModel> {
    return this.modelService.findWithPlans(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicle-models')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست مدل‌ها با فیلترهای کامل (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(VehicleModel)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: ModelFilterDto): Promise<PaginatedResponseDto<VehicleModel>> {
    return this.modelService.findAllForAdmin(q);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/vehicle-models/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'جزئیات یک مدل' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleModel> {
    return this.modelService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('vehicles/:vehicleId/models')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ایجاد مدل' })
  create(@Param('vehicleId', ParseUUIDPipe) vehicleId: string, @Body() dto: CreateVehicleModelDto): Promise<VehicleModel> {
    return this.modelService.create(vehicleId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('vehicle-models/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش مدل' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleModelDto): Promise<VehicleModel> {
    return this.modelService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('vehicle-models/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف مدل' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.modelService.remove(id);
  }
}
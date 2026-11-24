import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth,
} from '@nestjs/swagger';
import { InstallmentPlanService } from './installment-plan.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';
import { BulkCreateInstallmentPlansDto } from './dto/bulk-create-installment-plans.dto';
import { InstallmentFilterDto } from './dto/filter-installment.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';

@ApiTags('جدول اقساط (Installment Plans)')
@Controller()
export class InstallmentPlanController {
  constructor(private readonly planService: InstallmentPlanService) {}

  @Public()
  @Get('vehicle-models/slug/:slug/plans')
  @ApiOperation({ summary: 'جدول اقساط یک مدل' })
  @UseInterceptors(CacheInterceptor)
  findByModel(@Param('slug') slug: string): Promise<InstallmentPlan[]> {
    return this.planService.findByModelSlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/installment-plans')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست پلن‌های اقساط با فیلترهای کامل (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'modelId', required: false })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'minDuration', required: false })
  @ApiQuery({ name: 'maxDuration', required: false })
  @ApiQuery({ name: 'minMonthlyAmount', required: false })
  @ApiQuery({ name: 'maxMonthlyAmount', required: false })
  @ApiQuery({ name: 'isHighlighted', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(InstallmentPlan)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: InstallmentFilterDto): Promise<PaginatedResponseDto<InstallmentPlan>> {
    return this.planService.findAllForAdmin(q);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('vehicle-models/:modelId/plans')
  @ApiConsumes('application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ساخت دسته‌جمعی جدول اقساط' })
  bulkCreate(@Param('modelId', ParseUUIDPipe) modelId: string, @Body() dto: BulkCreateInstallmentPlansDto): Promise<InstallmentPlan[]> {
    return this.planService.bulkCreate(modelId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('installment-plans/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش یک ردیف اقساط' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInstallmentPlanDto): Promise<InstallmentPlan> {
    return this.planService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('installment-plans/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف یک ردیف اقساط' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.planService.remove(id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InstallmentPlanService } from './installment-plan.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto'; // ✅ ایمپورت شود
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';
import { BulkCreateInstallmentPlansDto } from './dto/bulk-create-installment-plans.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';

@ApiTags('جدول اقساط (Installment Plans)')
@Controller()
export class InstallmentPlanController {
  constructor(private readonly planService: InstallmentPlanService) {}

  // ==================== Public ====================
  @Public()
  @Get('vehicle-models/slug/:slug/plans')
  @ApiOperation({ summary: 'جدول اقساط یک مدل' })
  @UseInterceptors(CacheInterceptor)
  findByModel(@Param('slug') slug: string) {
    return this.planService.findByModelSlug(slug);
  }

  // ==================== Admin ====================
  
  // ✅ متد جدید: ساخت تکی
  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/installment-plans')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ایجاد یک طرح اقساط جدید (تکی)' })
  create(@Body() dto: CreateInstallmentPlanDto) {
    return this.planService.create(dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('vehicle-models/:modelId/plans')
  @ApiConsumes('application/json')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ساخت دسته‌جمعی جدول اقساط' })
  bulkCreate(@Param('modelId') modelId: string, @Body() dto: BulkCreateInstallmentPlansDto) {
    return this.planService.bulkCreate(modelId, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/installment-plans')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'لیست پلن‌های اقساط' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(InstallmentPlan)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.planService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('installment-plans/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.SALES_CONSULTANT)
  @ApiOperation({ summary: 'ویرایش یک ردیف اقساط' })
  update(@Param('id') id: string, @Body() dto: UpdateInstallmentPlanDto) {
    return this.planService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('installment-plans/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف یک ردیف اقساط' })
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
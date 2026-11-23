import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Category } from '../../database/entities/category/category.entity';

@ApiTags('دسته‌بندی‌ها (Categories)')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'لیست دسته‌بندی‌ها (فرانت‌اند)' })
  @UseInterceptors(CacheInterceptor)
  findActiveList() {
    return this.categoryService.findActiveList();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'دریافت یک دسته‌بندی با slug' })
  @UseInterceptors(CacheInterceptor)
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست دسته‌بندی‌ها (ادمین)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Category)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.categoryService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک دسته‌بندی' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ایجاد دسته‌بندی' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'ویرایش دسته‌بندی' })
  update(@Param('id',ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف دسته‌بندی' })
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
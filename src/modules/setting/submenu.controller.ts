import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SubmenuService } from './submenu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateSubmenuDto } from './dto/menu/create-sub-menu.dto'; 
import { UpdateSubmenuDto } from './dto/menu/update-sub-menu.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Submenu } from '../../database/entities/menu/sub-menu.entity';

@ApiTags('پنل مدیریت (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus/:menuId/submenus')
export class SubmenuController {
  constructor(private readonly submenuService: SubmenuService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست ساب‌منوهای یک منو' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Submenu)
  @UseInterceptors(CacheInterceptor)
  findAll(@Param('menuId') menuId: string, @Query() q: AdminPaginationDto) {
    return this.submenuService.findAllByMenu(menuId, q);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک ساب‌منو' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.submenuService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ایجاد ساب‌منو' })
  create(@Param('menuId') menuId: string, @Body() dto: CreateSubmenuDto) {
    return this.submenuService.create(menuId, dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ویرایش ساب‌منو' })
  update(@Param('id') id: string, @Body() dto: UpdateSubmenuDto) {
    return this.submenuService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف ساب‌منو' })
  remove(@Param('id') id: string) {
    return this.submenuService.remove(id);
  }
}
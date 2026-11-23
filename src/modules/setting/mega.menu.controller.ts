import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MegamenuService } from './megamenu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateMegamenuDto } from './dto/menu/create-mega-menu.dto';
import { UpdateMegamenuDto } from './dto/menu/update-mega-menu.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Megamenu } from '../../database/entities/menu/mega-menu.entity';

@ApiTags('پنل مدیریت (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('submenus/:submenuId/megamenus')
export class MegamenuController {
  constructor(private readonly megamenuService: MegamenuService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست مگا منوهای یک ساب‌منو' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Megamenu)
  @UseInterceptors(CacheInterceptor)
  findAll(@Param('submenuId') submenuId: string, @Query() q: AdminPaginationDto) {
    return this.megamenuService.findAllBySubmenu(submenuId, q);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک مگا منو' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.megamenuService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ایجاد مگا منو' })
  create(@Param('submenuId') submenuId: string, @Body() dto: CreateMegamenuDto) {
    return this.megamenuService.create(submenuId, dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ویرایش مگا منو' })
  update(@Param('id') id: string, @Body() dto: UpdateMegamenuDto) {
    return this.megamenuService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف مگا منو' })
  remove(@Param('id') id: string) {
    return this.megamenuService.remove(id);
  }
}
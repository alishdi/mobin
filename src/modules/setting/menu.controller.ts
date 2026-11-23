import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateMenuDto } from './dto/menu/create-menu.dto';
import { UpdateMenuDto } from './dto/menu/update-menu.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Menu } from '../../database/entities/menu/menu.entity';

@ApiTags('منوها (Menus)')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get('tree')
  @ApiOperation({ summary: 'درخت کامل منوها' })
  @UseInterceptors(CacheInterceptor)
  getFullTree() {
    return this.menuService.getFullTree();
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست منوها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Menu)
  @UseInterceptors(CacheInterceptor)
  findAllForAdmin(@Query() q: AdminPaginationDto) {
    return this.menuService.findAllForAdmin(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'جزئیات یک منو' })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ایجاد منو' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ویرایش منو' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف منو' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
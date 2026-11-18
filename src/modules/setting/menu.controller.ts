import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RoleName } from '../../database/entities/role.entity';
import { CreateMenuDto } from './dto/menu/create-menu.dto'; 
import { UpdateMenuDto } from './dto/menu/update-menu.dto';

@ApiTags('مدیریت منوها (Menu Management)')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ==================== Public ====================
  @Public()
  @Get('tree')
  @ApiOperation({ summary: 'دریافت درخت کامل منوها (برای فرانت‌اند)' })
  getFullTree() {
    return this.menuService.getFullTree();
  }

  // ==================== Admin CRUD ====================
  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت تمام منوها' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت جزئیات یک منو' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:create')
  @ApiOperation({ summary: 'ایجاد منوی جدید' })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:update')
  @ApiOperation({ summary: 'ویرایش منو' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions('menus:delete')
  @ApiOperation({ summary: 'حذف منو (ساب‌منوها و مگا منوها هم حذف می‌شوند)' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
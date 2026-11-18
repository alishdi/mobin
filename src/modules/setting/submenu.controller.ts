import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { SubmenuService } from './submenu.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RoleName } from '../../database/entities/role.entity';
import { CreateSubmenuDto } from './dto/menu/create-sub-menu.dto'; 
import { UpdateSubmenuDto } from './dto/menu/update-sub-menu.dto'; 

@ApiTags('مدیریت ساب‌منوها (Submenu Management)')
@Controller('menus/:menuId/submenus')
export class SubmenuController {
  constructor(private readonly submenuService: SubmenuService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت تمام ساب‌منوهای یک منو' })
  findAll(@Param('menuId') menuId: string) {
    return this.submenuService.findAllByMenu(menuId);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت جزئیات یک ساب‌منو' })
  findOne(@Param('id') id: string) {
    return this.submenuService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('submenus:create')
  @ApiOperation({ summary: 'ایجاد ساب‌منو زیر یک منو' })
  create(@Param('menuId') menuId: string, @Body() dto: CreateSubmenuDto) {
    return this.submenuService.create(menuId, dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('submenus:update')
  @ApiOperation({ summary: 'ویرایش ساب‌منو' })
  update(@Param('id') id: string, @Body() dto: UpdateSubmenuDto) {
    return this.submenuService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions('submenus:delete')
  @ApiOperation({ summary: 'حذف ساب‌منو (مگا منوهای آن هم حذف می‌شوند)' })
  remove(@Param('id') id: string) {
    return this.submenuService.remove(id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { MegamenuService } from './megamenu.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RoleName } from '../../database/entities/role.entity';
import { CreateMegamenuDto } from './dto/menu/create-mega-menu.dto'; 
import { UpdateMegamenuDto } from './dto/menu/update-mega-menu.dto';

@ApiTags('مدیریت مگا منوها (Megamenu Management)')
@Controller('submenus/:submenuId/megamenus')
export class MegamenuController {
  constructor(private readonly megamenuService: MegamenuService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت تمام مگا منوهای یک ساب‌منو' })
  findAll(@Param('submenuId') submenuId: string) {
    return this.megamenuService.findAllBySubmenu(submenuId);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('menus:read')
  @ApiOperation({ summary: 'دریافت جزئیات یک مگا منو' })
  findOne(@Param('id') id: string) {
    return this.megamenuService.findOne(id);
  }

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('megamenus:create')
  @ApiOperation({ summary: 'ایجاد مگا منو زیر یک ساب‌منو' })
  create(@Param('submenuId') submenuId: string, @Body() dto: CreateMegamenuDto) {
    return this.megamenuService.create(submenuId, dto);
  }

  @Put(':id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('megamenus:update')
  @ApiOperation({ summary: 'ویرایش مگا منو' })
  update(@Param('id') id: string, @Body() dto: UpdateMegamenuDto) {
    return this.megamenuService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions('megamenus:delete')
  @ApiOperation({ summary: 'حذف مگا منو' })
  remove(@Param('id') id: string) {
    return this.megamenuService.remove(id);
  }
}
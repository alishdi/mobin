import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('مدیریت نقش‌ها و دسترسی‌ها (RBAC Admin)')
@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'دریافت لیست تمام دسترسی‌ها' })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post('permissions')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'ایجاد دسترسی جدید' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Put('permissions/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'ویرایش دسترسی' })
  updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.rbacService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'حذف دسترسی' })
  deletePermission(@Param('id') id: string) {
    return this.rbacService.deletePermission(id);
  }

  @Get('roles')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'دریافت لیست تمام نقش‌ها' })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'دریافت جزئیات یک نقش' })
  findOneRole(@Param('id') id: string) {
    return this.rbacService.findOneRole(id);
  }

  @Post('roles')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'ایجاد نقش جدید' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Put('roles/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'ویرایش نقش' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'حذف نقش' })
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }
}
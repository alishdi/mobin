import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Role } from '../../database/entities/role-permission/role.entity';
import { Permission } from '../../database/entities/role-permission/permission.entity';

@ApiTags('پنل مدیریت (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'لیست دسترسی‌ها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Permission)
  @UseInterceptors(CacheInterceptor)
  findAllPermissions(@Query() q: AdminPaginationDto) {
    return this.rbacService.findAllPermissions(q);
  }

  @Post('permissions')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'ایجاد دسترسی' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Put('permissions/:id')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
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
  @ApiOperation({ summary: 'لیست نقش‌ها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiPaginatedResponse(Role)
  @UseInterceptors(CacheInterceptor)
  findAllRoles(@Query() q: AdminPaginationDto) {
    return this.rbacService.findAllRoles(q);
  }

  @Get('roles/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'جزئیات یک نقش' })
  @UseInterceptors(CacheInterceptor)
  findOneRole(@Param('id') id: string) {
    return this.rbacService.findOneRole(id);
  }

  @Post('roles')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'ایجاد نقش' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Put('roles/:id')
  @Roles(RoleName.SUPER_ADMIN)
  @ApiConsumes('application/x-www-form-urlencoded')
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
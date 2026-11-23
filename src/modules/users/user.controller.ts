import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { User } from '../../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SafeUserResponseDto } from './dto/user-response.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';


@ApiTags('پنل مدیریت - کاربران (Admin Users)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions('users:read')
  @ApiOperation({ summary: 'لیست کاربران (صفحه‌بندی + جستجو در نام، موبایل، ایمیل، کد ملی)' })
  @ApiPaginatedResponse(User)
  @UseInterceptors(CacheInterceptor)
  findAll(@Query() q: AdminPaginationDto): Promise<PaginatedResponseDto<User>> {
    return this.userService.findAll(q);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions('users:read')
  @ApiOperation({ summary: 'جزئیات یک کاربر' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'شناسه کاربر' })
  @ApiOkResponse({ type: SafeUserResponseDto })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SafeUserResponseDto> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions('users:update')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiOperation({ summary: 'ویرایش کامل کاربر (شامل موبایل، نقش‌ها و وضعیت)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'شناسه کاربر' })
  @ApiOkResponse({ type: SafeUserResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<SafeUserResponseDto> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions('users:delete')
  @ApiOperation({ summary: 'حذف کاربر (Soft Delete)' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'شناسه کاربر' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}

@ApiTags('پروفایل کاربری (User Profile)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserProfileController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @ApiOperation({ summary: 'دریافت پروفایل کاربر فعلی' })
  @ApiOkResponse({ type: SafeUserResponseDto })
  getProfile(@CurrentUser() user: User): Promise<SafeUserResponseDto> {
    return this.userService.getProfile(user.id);
  }

  @Put('profile')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiOperation({ summary: 'ویرایش پروفایل کاربر فعلی' })
  @ApiOkResponse({ type: SafeUserResponseDto })
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ): Promise<SafeUserResponseDto> {
    return this.userService.updateProfile(user.id, dto);
  }
}
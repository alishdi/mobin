import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { CreateSliderDto } from './dto/slider/create-slider.dto'; 
import { UpdateSliderDto } from './dto/slider/update-slider.dto'; 
import { CreateFooterDto } from './dto/footer/create-footer.dto'; 
import { UpdateFooterDto } from './dto/footer/update-footer.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { Slider } from '../../database/entities/slider.entity';
import { Footer } from '../../database/entities/footer/footer.entity';

@ApiTags('تنظیمات سایت (Settings)')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('sliders/:location')
  @ApiOperation({ summary: 'اسلایدرهای یک بخش' })
  @UseInterceptors(CacheInterceptor)
  getSliders(@Param('location') location: string) {
    return this.settingsService.getActiveSliders(location);
  }

  @Public()
  @Get('footer')
  @ApiOperation({ summary: 'کل فوتر' })
  @UseInterceptors(CacheInterceptor)
  getFooter() {
    return this.settingsService.getFooter();
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/sliders')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست اسلایدرها' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(Slider)
  @UseInterceptors(CacheInterceptor)
  findAllSliders(@Query() q: AdminPaginationDto) {
    return this.settingsService.findAllSliders(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sliders')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ایجاد اسلایدر' })
  createSlider(@Body() dto: CreateSliderDto) {
    return this.settingsService.createSlider(dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('sliders/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ویرایش اسلایدر' })
  updateSlider(@Param('id') id: string, @Body() dto: UpdateSliderDto) {
    return this.settingsService.updateSlider(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sliders/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف اسلایدر' })
  deleteSlider(@Param('id') id: string) {
    return this.settingsService.deleteSlider(id);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/footers')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'لیست بخش‌های فوتر' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiPaginatedResponse(Footer)
  @UseInterceptors(CacheInterceptor)
  findAllFooters(@Query() q: AdminPaginationDto) {
    return this.settingsService.findAllFooters(q);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('footer')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ایجاد بخش فوتر' })
  createFooter(@Body() dto: CreateFooterDto) {
    return this.settingsService.createFooter(dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('footer/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
  @ApiOperation({ summary: 'ویرایش بخش فوتر' })
  updateFooter(@Param('id') id: string, @Body() dto: UpdateFooterDto) {
    return this.settingsService.updateFooter(id, dto);
  }

  @ApiTags('پنل مدیریت (Admin)')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('footer/:id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'حذف بخش فوتر' })
  deleteFooter(@Param('id') id: string) {
    return this.settingsService.deleteFooter(id);
  }
}
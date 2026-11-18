import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RoleName } from '../../database/entities/role.entity';

import { CreateSliderDto } from './dto/slider/create-slider.dto'; 
import { UpdateSliderDto } from './dto/slider/update-slider.dto'; 
import { CreateFooterDto } from './dto/footer/create-footer.dto'; 
import { UpdateFooterDto } from './dto/footer/update-footer.dto'; 
import { UpdateSettingDto } from './dto/update-setting.dto';

@ApiTags('تنظیمات سایت (Settings)')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // =================================================================
  // ۱. تنظیمات عمومی (شامل لوگو)
  // =================================================================

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'دریافت تمام تنظیمات عمومی سایت' })
  getAllPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Public()
  @Get('public/:group')
  @ApiOperation({ summary: 'دریافت تنظیمات عمومی یک گروه خاص (general, seo, contact)' })
  @ApiParam({ name: 'group', example: 'general' })
  getPublicSettingsByGroup(@Param('group') group: string) {
    return this.settingsService.getPublicSettings(group);
  }

  @Put('public/:key')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('settings:update')
  @ApiOperation({ summary: 'به‌روزرسانی یک تنظیم (مثلاً تغییر لوگو با key="site_logo")' })
  @ApiParam({ name: 'key', example: 'site_logo' })
  updateSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.updateSetting(key, dto);
  }

  // =================================================================
  // ۲. اسلایدرها
  // =================================================================

  @Public()
  @Get('sliders/:location')
  @ApiOperation({ summary: 'دریافت اسلایدرهای فعال یک بخش' })
  @ApiParam({ name: 'location', example: 'home' })
  getSliders(@Param('location') location: string) {
    return this.settingsService.getActiveSliders(location);
  }

  @Post('sliders')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('sliders:create')
  @ApiOperation({ summary: 'ایجاد اسلایدر جدید' })
  createSlider(@Body() dto: CreateSliderDto) {
    return this.settingsService.createSlider(dto);
  }

  @Put('sliders/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('sliders:update')
  @ApiOperation({ summary: 'ویرایش اسلایدر' })
  updateSlider(@Param('id') id: string, @Body() dto: UpdateSliderDto) {
    return this.settingsService.updateSlider(id, dto);
  }

  @Delete('sliders/:id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions('sliders:delete')
  @ApiOperation({ summary: 'حذف اسلایدر' })
  deleteSlider(@Param('id') id: string) {
    return this.settingsService.deleteSlider(id);
  }

  // =================================================================
  // ۳. فوتر
  // =================================================================

  @Public()
  @Get('footers')
  @ApiOperation({ summary: 'دریافت تمام بخش‌های فوتر' })
  getFooters() {
    return this.settingsService.getFooters();
  }

  @Post('footers')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('footers:create')
  @ApiOperation({ summary: 'ایجاد بخش جدید در فوتر' })
  createFooter(@Body() dto: CreateFooterDto) {
    return this.settingsService.createFooter(dto);
  }

  @Put('footers/:id')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.OPERATOR)
  @Permissions('footers:update')
  @ApiOperation({ summary: 'ویرایش بخش فوتر' })
  updateFooter(@Param('id') id: string, @Body() dto: UpdateFooterDto) {
    return this.settingsService.updateFooter(id, dto);
  }

  @Delete('footers/:id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @Permissions('footers:delete')
  @ApiOperation({ summary: 'حذف بخش فوتر' })
  deleteFooter(@Param('id') id: string) {
    return this.settingsService.deleteFooter(id);
  }
}
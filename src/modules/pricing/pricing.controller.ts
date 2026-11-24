import { Controller, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { UpdateBrandPricingDto, VehicleModelPricingDto } from './dto/update-brand-pricing.dto'

@ApiTags('Pricing (Public API for Employer)')
@Controller('api/v1/pricing')
@UseGuards(ApiKeyGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Patch('update/:brandSlug')
  @ApiOperation({ summary: 'آپدیت قیمت یک مدل خودرو به صورت تکی' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'کلید API کارفرما' })
  @ApiParam({ name: 'brandSlug', description: 'اسلاگ برند (مثلاً iran-khodro)' })
  @ApiResponse({ status: 200, description: 'آپدیت با موفقیت انجام شد' })
  updateSingle(
    @Param('brandSlug') brandSlug: string,
    @Body() dto: VehicleModelPricingDto,
  ) {
    return this.pricingService.updateSingleModelPricing(dto, brandSlug);
  }

  @Patch('update-by-brand')
  @ApiOperation({ summary: 'آپدیت قیمت‌های یک برند به صورت گروهی (Bulk Update)' })
  @ApiHeader({ name: 'x-api-key', required: true, description: 'کلید API کارفرما' })
  @ApiResponse({ status: 200, description: 'آپدیت گروهی انجام شد' })
  updateByBrand(@Body() dto: UpdateBrandPricingDto) {
    return this.pricingService.updateBrandPricing(dto);
  }
}
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Brand } from '../../database/entities/product/brand.entity';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';
import { CacheClearService } from '../../common/services/cache-clear.service';

import { UpdateBrandPricingDto, VehicleModelPricingDto } from './dto/update-brand-pricing.dto';
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly dataSource: DataSource,
    private readonly cacheClearService: CacheClearService,
  ) {}

  // ✅ تابع کمکی: محاسبه داینامیک ماه پیش‌پرداخت دوم
  private calculateSecondDownPaymentMonth(durationMonths: number): number {
    return durationMonths <= 36 ? 2 : 7;
  }

  // ✅ تابع کمکی: محاسبه داینامیک مجموع اقساط
  private calculateTotalInstallments(monthlyAmount: number, durationMonths: number): number {
    return monthlyAmount * durationMonths;
  }

  // ==========================================
  // ۱. آپدیت گروهی قیمت‌های یک برند
  // ==========================================
  async updateBrandPricing(dto: UpdateBrandPricingDto) {
    // ۱. بررسی وجود برند
    const brand = await this.brandRepo.findOne({ where: { slug: dto.brandSlug } });
    if (!brand) {
      throw new NotFoundException(`برند با اسلاگ ${dto.brandSlug} یافت نشد`);
    }

    const updatedModels: string[] = [];
    const failedModels: { modelSlug: string; reason: string }[] = [];

    // ۲. شروع تراکنش برای آپدیت اتمیک
    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.vehicles) {
        try {
          // پیدا کردن مدل با اسلاگ‌های ارسالی
          const model = await manager.createQueryBuilder(VehicleModel, 'model')
            .innerJoin('model.vehicle', 'vehicle')
            .where('vehicle.slug = :vSlug', { vSlug: item.vehicleSlug })
            .andWhere('vehicle.brand_id = :brandId', { brandId: brand.id })
            .andWhere('model.slug = :mSlug', { mSlug: item.modelSlug })
            .getOne();

          if (!model) {
            failedModels.push({
              modelSlug: item.modelSlug,
              reason: 'مدل یا خودرو در دیتابیس یافت نشد',
            });
            continue;
          }

          // اعتبارسنجی: فقط یک ردیف برجسته مجاز است
          const highlightedCount = item.plans.filter(p => p.isHighlighted).length;
          if (highlightedCount > 1) {
            throw new BadRequestException(`مدل ${item.modelSlug}: بیش از یک ردیف نمی‌تواند برجسته (isHighlighted) باشد.`);
          }

          // اعتبارسنجی: مدت اقساط نباید تکراری باشد
          const durations = item.plans.map(p => p.durationMonths);
          if (new Set(durations).size !== durations.length) {
            throw new BadRequestException(`مدل ${item.modelSlug}: مدت اقساط (durationMonths) نباید تکراری باشد.`);
          }

          // ✅ آپدیت فقط فیلدهای توصیفی مدل (بدون اطلاعات مالی)
          await manager.update(VehicleModel, model.id, {
            year: item.year,
            mileage: item.mileage,
          });

          // ✅ حذف طرح‌های قدیمی و درج مجدد با اطلاعات مالی کامل
          await manager.delete(InstallmentPlan, { model: { id: model.id } });

          const newPlans = item.plans.map(p => {
            const secondDownPaymentMonth = this.calculateSecondDownPaymentMonth(p.durationMonths);
            const totalInstallments = this.calculateTotalInstallments(p.monthlyAmount, p.durationMonths);

            return manager.create(InstallmentPlan, {
              durationMonths: p.durationMonths,
              monthlyAmount: p.monthlyAmount,
              totalInstallments: totalInstallments,
              firstDownPayment: p.firstDownPayment,   // ✅ در Plan ذخیره می‌شود
              totalPrice: p.totalPrice,               // ✅ در Plan ذخیره می‌شود
              secondDownPaymentMonth: secondDownPaymentMonth, // ✅ فرمول داینامیک
              isHighlighted: p.isHighlighted || false,
              order: p.durationMonths,
              model: { id: model.id },
            });
          });

          await manager.save(InstallmentPlan, newPlans);
          updatedModels.push(item.modelSlug);

        } catch (error:any) {
          this.logger.error(`خطا در آپدیت مدل ${item.modelSlug}: ${error.message}`);
          failedModels.push({ modelSlug: item.modelSlug, reason: error.message });
        }
      }
    });

    // ۳. پاک‌سازی کش در صورت موفقیت حداقل یک آپدیت
    if (updatedModels.length > 0) {
      await this.cacheClearService.clearByPattern(`cache:*${dto.brandSlug}*`);
      await this.cacheClearService.clearByPattern('cache:*installment-plans*');
      await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
      await this.cacheClearService.clearByPattern('cache:*brands*');
    }

    this.logger.log(
      `آپدیت برند ${dto.brandSlug} پایان یافت. موفق: ${updatedModels.length}، ناموفق: ${failedModels.length}`,
    );

    return {
      success: true,
      message: 'عملیات آپدیت قیمت به پایان رسید',
      updatedCount: updatedModels.length,
      failedCount: failedModels.length,
      updatedModels,
      failedModels: failedModels.length > 0 ? failedModels : undefined,
    };
  }

  // ==========================================
  // ۲. آپدیت قیمت یک مدل خودرو به صورت تکی
  // ==========================================
  async updateSingleModelPricing(dto: VehicleModelPricingDto, brandSlug: string) {
    const brand = await this.brandRepo.findOne({ where: { slug: brandSlug } });
    if (!brand) throw new NotFoundException(`برند ${brandSlug} یافت نشد`);

    const model = await this.dataSource.createQueryBuilder(VehicleModel, 'model')
      .innerJoin('model.vehicle', 'vehicle')
      .where('vehicle.slug = :vSlug', { vSlug: dto.vehicleSlug })
      .andWhere('vehicle.brand_id = :brandId', { brandId: brand.id })
      .andWhere('model.slug = :mSlug', { mSlug: dto.modelSlug })
      .getOne();

    if (!model) {
      throw new NotFoundException('مدل خودرو با این مشخصات در این برند یافت نشد');
    }

    // اعتبارسنجی: فقط یک ردیف برجسته مجاز است
    if (dto.plans.filter(p => p.isHighlighted).length > 1) {
      throw new BadRequestException('فقط یک ردیف می‌تواند برجسته (isHighlighted) باشد');
    }

    // اعتبارسنجی: مدت اقساط نباید تکراری باشد
    const durations = dto.plans.map(p => p.durationMonths);
    if (new Set(durations).size !== durations.length) {
      throw new BadRequestException('مدت اقساط (durationMonths) نباید تکراری باشد');
    }

    await this.dataSource.transaction(async (manager) => {
      // ✅ آپدیت فقط فیلدهای توصیفی مدل
      await manager.update(VehicleModel, model.id, {
        year: dto.year,
        mileage: dto.mileage,
      });

      // ✅ حذف طرح‌های قدیمی و درج مجدد
      await manager.delete(InstallmentPlan, { model: { id: model.id } });

      const newPlans = dto.plans.map(p => {
        const secondDownPaymentMonth = this.calculateSecondDownPaymentMonth(p.durationMonths);
        const totalInstallments = this.calculateTotalInstallments(p.monthlyAmount, p.durationMonths);

        return manager.create(InstallmentPlan, {
          durationMonths: p.durationMonths,
          monthlyAmount: p.monthlyAmount,
          totalInstallments: totalInstallments,
          firstDownPayment: p.firstDownPayment,
          totalPrice: p.totalPrice,
          secondDownPaymentMonth: secondDownPaymentMonth,
          isHighlighted: p.isHighlighted || false,
          order: p.durationMonths,
          model: { id: model.id },
        });
      });

      await manager.save(InstallmentPlan, newPlans);
    });

    // ✅ پاک‌سازی کش
    await this.cacheClearService.clearByPattern(`cache:*${brandSlug}*`);
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    await this.cacheClearService.clearByPattern('cache:*brands*');

    return {
      success: true,
      message: 'قیمت مدل با موفقیت آپدیت شد',
      updatedAt: new Date().toISOString(),
      data: {
        brand: brandSlug,
        vehicle: dto.vehicleSlug,
        model: dto.modelSlug,
      },
    };
  }
}
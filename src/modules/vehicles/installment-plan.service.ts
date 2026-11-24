import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';
import { BulkCreateInstallmentPlansDto } from './dto/bulk-create-installment-plans.dto';
import { InstallmentFilterDto } from './dto/filter-installment.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class InstallmentPlanService {
  constructor(
    @InjectRepository(InstallmentPlan) private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(VehicleModel) private readonly modelRepo: Repository<VehicleModel>,
    private readonly cacheClearService: CacheClearService,
  ) { }

  // ==================== Public ====================

  async findByModelSlug(slug: string): Promise<InstallmentPlan[]> {
    const model = await this.modelRepo.findOne({ where: { slug } });
    if (!model) throw new NotFoundException('مدل یافت نشد');

    return this.planRepo.find({
      where: { model: { id: model.id }, isActive: true },
      order: { durationMonths: 'ASC' },
    });
  }

  // ==================== Admin ====================

  async findAllForAdmin(q: InstallmentFilterDto): Promise<PaginatedResponseDto<InstallmentPlan>> {
    const {
      page = 1, limit = 10, sortBy = 'durationMonths', sortOrder = 'ASC',
      modelId, vehicleId, brandId,
      minDuration, maxDuration,
      minMonthlyAmount, maxMonthlyAmount,
      isHighlighted, isActive,
    } = q;

    const qb = this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.model', 'model')
      .leftJoinAndSelect('model.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.product', 'product')
      .select([
        'plan.id', 'plan.durationMonths', 'plan.monthlyAmount',
        'plan.totalInstallments', 'plan.isHighlighted', 'plan.order',
        'plan.isActive', 'plan.createdAt', 'plan.updatedAt',
        'model.id', 'model.title', 'model.slug',
        'vehicle.id', 'vehicle.title', 'vehicle.slug',
        'brand.id', 'brand.title', 'brand.slug',
        'product.id', 'product.title', 'product.slug',
      ]);

    if (modelId) {
      qb.andWhere('plan.model_id = :modelId', { modelId });
    }

    if (vehicleId) {
      qb.andWhere('model.vehicle_id = :vehicleId', { vehicleId });
    }

    if (brandId) {
      qb.andWhere('vehicle.brand_id = :brandId', { brandId });
    }

    if (minDuration !== undefined) {
      qb.andWhere('plan.durationMonths >= :minDuration', { minDuration });
    }

    if (maxDuration !== undefined) {
      qb.andWhere('plan.durationMonths <= :maxDuration', { maxDuration });
    }

    if (minMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount >= :minMonthlyAmount', { minMonthlyAmount });
    }

    if (maxMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount <= :maxMonthlyAmount', { maxMonthlyAmount });
    }

    if (isHighlighted !== undefined) {
      qb.andWhere('plan.isHighlighted = :isHighlighted', { isHighlighted });
    }

    if (isActive !== undefined) {
      qb.andWhere('plan.isActive = :isActive', { isActive });
    }

    const validSortFields = ['durationMonths', 'monthlyAmount', 'totalInstallments', 'createdAt', 'updatedAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'durationMonths';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(`plan.${safeSortBy}`, safeSortOrder);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async bulkCreate(modelId: string, dto: BulkCreateInstallmentPlansDto): Promise<InstallmentPlan[]> {
    const model = await this.modelRepo.findOne({ where: { id: modelId } });
    if (!model) throw new NotFoundException('مدل یافت نشد');

    const durations = dto.plans.map((p) => p.durationMonths);
    if (new Set(durations).size !== durations.length) {
      throw new BadRequestException('مدت اقساط نباید تکراری باشد');
    }

    await this.planRepo.delete({ model: { id: modelId } });

    const plans = dto.plans.map((p) =>
      this.planRepo.create({
        durationMonths: p.durationMonths,
        monthlyAmount: p.monthlyAmount,       
        totalInstallments: p.totalInstallments, 
        isHighlighted: p.isHighlighted ?? false,
        secondDownPaymentMonth: p.secondDownPaymentMonth ?? this.calculateSecondDownPaymentMonth(p.durationMonths), // ✅ رفع خطا
        order: p.order ?? p.durationMonths,
        model: model,
      })
    );

    const saved = await this.planRepo.save(plans);
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    return saved;
  }

  async update(id: string, dto: UpdateInstallmentPlanDto): Promise<InstallmentPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('پلن اقساط یافت نشد');
    Object.assign(plan, dto);
    const saved = await this.planRepo.save(plan);
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('پلن اقساط یافت نشد');
    await this.planRepo.remove(plan);
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
  }
  private calculateSecondDownPaymentMonth(durationMonths: number): number {
    return durationMonths <= 36 ? 2 : 7;
  }
}
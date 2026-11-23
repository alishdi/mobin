import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallmentPlan } from '../../database/entities/installment/installment-plan.entity';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto'; // ✅ ایمپورت شود
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';
import { BulkCreateInstallmentPlansDto } from './dto/bulk-create-installment-plans.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service'; // ✅ ایمپورت شود

@Injectable()
export class InstallmentPlanService {
  constructor(
    @InjectRepository(InstallmentPlan) private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(VehicleModel) private readonly modelRepo: Repository<VehicleModel>,
    private readonly cacheClearService: CacheClearService, // ✅ تزریق شده
  ) {}

  // ==================== متد جدید: ساخت تکی ====================
  async create(dto: CreateInstallmentPlanDto): Promise<InstallmentPlan> {
    // ۱. بررسی وجود مدل خودرو
    const model = await this.modelRepo.findOne({ where: { id: dto.modelId } });
    if (!model) {
      throw new NotFoundException('مدل خودرو یافت نشد');
    }

    // ۲. ساخت و ذخیره طرح اقساط
    const plan = this.planRepo.create({
      ...dto,
      model,
      order: dto.order ?? dto.durationMonths, // اگر order داده نشد، بر اساس مدت زمان مرتب شود
    });

    const saved = await this.planRepo.save(plan);

    // ۳. پاک‌سازی کش مرتبط
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');

    return saved;
  }
  // ============================================================

  async findByModelSlug(slug: string): Promise<InstallmentPlan[]> {
    const model = await this.modelRepo.findOne({ where: { slug } });
    if (!model) throw new NotFoundException('مدل یافت نشد');

    return this.planRepo.find({
      where: { model: { id: model.id }, isActive: true },
      order: { durationMonths: 'ASC' },
    });
  }

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<InstallmentPlan>> {
    const [data, total] = await this.planRepo.findAndCount({
      relations: { model: { vehicle: { brand: true } } },
      select: {
        id: true, durationMonths: true, monthlyAmount: true,
        totalInstallments: true, isHighlighted: true, order: true,
        isActive: true, createdAt: true, updatedAt: true,
        model: {
          id: true, title: true, slug: true,
          vehicle: { id: true, title: true, slug: true, brand: { id: true, title: true, slug: true } },
        },
      },
      order: { [q.sortBy || 'durationMonths']: q.sortOrder || 'ASC' },
      skip: q.skip,
      take: q.limit,
    });

    return PaginatedResponseDto.create(data, total, q.page!, q.limit!);
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
      this.planRepo.create({ ...p, model, order: p.order ?? p.durationMonths }),
    );

    const saved = await this.planRepo.save(plans);
    
    // ✅ پاک‌سازی کش
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    
    return saved;
  }

  async update(id: string, dto: UpdateInstallmentPlanDto): Promise<InstallmentPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('پلن اقساط یافت نشد');

    Object.assign(plan, dto);
    const saved = await this.planRepo.save(plan);
    
    // ✅ پاک‌سازی کش
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    
    return saved;
  }

  async remove(id: string): Promise<void> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('پلن اقساط یافت نشد');

    await this.planRepo.remove(plan);
    
    // ✅ پاک‌سازی کش
    await this.cacheClearService.clearByPattern('cache:*installment-plans*');
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
  }
}
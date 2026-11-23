import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dto/update-vehicle-model.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class VehicleModelService {
  constructor(
    @InjectRepository(VehicleModel) private readonly modelRepo: Repository<VehicleModel>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    private readonly cacheClearService: CacheClearService,
  ) { }

  // ==================== Public ====================

  async findActiveByVehicleSlug(
    vehicleSlug: string,
    q: PaginationQueryDto,
  ): Promise<{ vehicle: Partial<Vehicle>; models: PaginatedResponseDto<VehicleModel> }> {
    const { page = 1, limit = 12 } = q;

    const vehicle = await this.vehicleRepo.findOne({
      where: { slug: vehicleSlug, isActive: true },
      select: { id: true, title: true, slug: true, imageUrl: true },
    });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');

    const qb = this.modelRepo
      .createQueryBuilder('model')
      .where('model.vehicleId = :vehicleId', { vehicleId: vehicle.id })
      .andWhere('model.isActive = :active', { active: true })
      .select([
        'model.id',
        'model.title',
        'model.slug',
        'model.year',
        'model.mileage',
        'model.firstDownPayment',
        'model.totalPrice',
        'model.imageUrl',
        'model.isFeatured',
        'model.order',
      ])
      .orderBy('model.order', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [models, total] = await qb.getManyAndCount();

    return {
      vehicle,
      models: PaginatedResponseDto.create(models, total, page, limit),
    };
  }

  async findWithPlans(slug: string): Promise<VehicleModel> {
    const model = await this.modelRepo.findOne({
      where: { slug, isActive: true },
      relations: { vehicle: { brand: { category: true } }, installmentPlans: true },
    });
    if (!model) throw new NotFoundException('مدل خودرو یافت نشد');

    model.installmentPlans = model.installmentPlans
      .filter((p) => p.isActive)
      .sort((a, b) => a.durationMonths - b.durationMonths);

    return model;
  }

  // ==================== Admin ====================

async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<VehicleModel>> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search } = q;
  const searchTerm = search?.trim();

  const qb = this.modelRepo
    .createQueryBuilder('model')
    .leftJoinAndSelect('model.vehicle', 'vehicle')
    .leftJoinAndSelect('vehicle.brand', 'brand')
    .select([
      'model.id',
      'model.title',
      'model.slug',
      'model.year',
      'model.mileage',
      'model.firstDownPayment',
      'model.totalPrice',
      'model.imageUrl',
      'model.order',
      'model.isActive',
      'model.isFeatured',
      'model.createdAt',
      'model.updatedAt',
      'vehicle.id',
      'vehicle.title',
      'vehicle.slug',
      'brand.id',
      'brand.title',
      'brand.slug',
    ]);

  // ✅ استفاده از ILike با کلمات جداگانه
  if (searchTerm && searchTerm.length >= 2) {
    // تقسیم جستجو به کلمات جداگانه
    const words = searchTerm.split(/\s+/).filter(w => w.length >= 2);
    
    if (words.length > 0) {
      const conditions = words.map((word, index) => {
        return `(model.title ILIKE :word${index} OR model.slug ILIKE :word${index} OR vehicle.title ILIKE :word${index} OR brand.title ILIKE :word${index})`;
      });
      
      const params = words.reduce((acc, word, index) => {
        acc[`word${index}`] = `%${word}%`;
        return acc;
      }, {});
      
      qb.andWhere(`(${conditions.join(' OR ')})`, params);
    }
  }

  // ✅ مرتب‌سازی
  const validSortFields = ['createdAt', 'updatedAt', 'order', 'title', 'year', 'totalPrice'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  qb.orderBy(`model.${safeSortBy}`, safeSortOrder);

  qb.skip((page - 1) * limit).take(limit);

  const [data, total] = await qb.getManyAndCount();

  return PaginatedResponseDto.create(data, total, page, limit);
}

  async findOne(id: string): Promise<VehicleModel> {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: { vehicle: true, installmentPlans: true },
    });
    if (!model) throw new NotFoundException('مدل یافت نشد');
    return model;
  }

  async create(vehicleId: string, dto: CreateVehicleModelDto): Promise<VehicleModel> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('خودرو والد یافت نشد');

    const exists = await this.modelRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');

    const saved = await this.modelRepo.save(this.modelRepo.create({ ...dto, vehicle }));
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
    return saved;
  }

  async update(id: string, dto: UpdateVehicleModelDto): Promise<VehicleModel> {
    const model = await this.modelRepo.findOne({ where: { id } });
    if (!model) throw new NotFoundException('مدل یافت نشد');

    if (dto.slug && dto.slug !== model.slug) {
      const exists = await this.modelRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }

    Object.assign(model, dto);
    const saved = await this.modelRepo.save(model);
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const model = await this.modelRepo.findOne({ where: { id } });
    if (!model) throw new NotFoundException('مدل یافت نشد');

    await this.modelRepo.remove(model);
    await this.cacheClearService.clearByPattern('cache:*vehicle-models*');
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
  }
}
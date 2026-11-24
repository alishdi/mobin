import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleModel } from '../../database/entities/vehicles/vehicle-model.entity';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dto/update-vehicle-model.dto';
import { ModelFilterDto } from './dto/vehicle-model-filter.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class VehicleModelService {
  constructor(
    @InjectRepository(VehicleModel) private readonly modelRepo: Repository<VehicleModel>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  // ==================== Public ====================

  async findActiveByVehicleSlug(vehicleSlug: string, filter: ModelFilterDto): Promise<PaginatedResponseDto<VehicleModel>> {
    const {
      page = 1, limit = 12, year, isFeatured, isActive = true,
      minPrice, maxPrice,
    } = filter;

    const vehicle = await this.vehicleRepo.findOne({
      where: { slug: vehicleSlug, isActive: true },
      select: { id: true, title: true, slug: true, imageUrl: true },
    });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');

    const qb = this.modelRepo
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.product', 'product')
      .leftJoinAndSelect('model.installmentPlans', 'plan', 'plan.isActive = :planActive', { planActive: true })
      .where('model.vehicle_id = :vehicleId', { vehicleId: vehicle.id })
      .andWhere('model.isActive = :isActive', { isActive })
      .select([
        'model.id', 'model.title', 'model.slug', 'model.year',
        'model.mileage', 'model.firstDownPayment', 'model.totalPrice',
        'model.imageUrl', 'model.isFeatured', 'model.order', 'model.isActive',
        'model.createdAt', 'model.updatedAt',
        'vehicle.id', 'vehicle.title', 'vehicle.slug',
        'brand.id', 'brand.title', 'brand.slug',
        'product.id', 'product.title', 'product.slug',
        'plan.id', 'plan.durationMonths', 'plan.monthlyAmount',
        'plan.totalInstallments', 'plan.isHighlighted', 'plan.isActive',
      ]);

    if (year) {
      qb.andWhere('model.year = :year', { year });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('model.isFeatured = :isFeatured', { isFeatured });
    }

    if (minPrice !== undefined) {
      qb.andWhere('model.totalPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('model.totalPrice <= :maxPrice', { maxPrice });
    }

    qb.orderBy('model.order', 'ASC')
      .addOrderBy('plan.durationMonths', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findWithPlans(slug: string): Promise<VehicleModel> {
    const model = await this.modelRepo.findOne({
      where: { slug, isActive: true },
      relations: { vehicle: { brand: { product: true } }, installmentPlans: true },
    });
    if (!model) throw new NotFoundException('مدل خودرو یافت نشد');

    model.installmentPlans = model.installmentPlans
      .filter((p) => p.isActive)
      .sort((a, b) => a.durationMonths - b.durationMonths);

    return model;
  }

  // ==================== Admin ====================

  async findAllForAdmin(q: ModelFilterDto): Promise<PaginatedResponseDto<VehicleModel>> {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search,
      vehicleId, brandId, year, isFeatured, isActive,
      minPrice, maxPrice,
    } = q;

    const qb = this.modelRepo
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.product', 'product')
      .leftJoinAndSelect('model.installmentPlans', 'plan', 'plan.isActive = :planActive', { planActive: true })
      .select([
        'model.id', 'model.title', 'model.slug', 'model.year',
        'model.mileage', 'model.firstDownPayment', 'model.totalPrice',
        'model.imageUrl', 'model.isFeatured', 'model.order', 'model.isActive',
        'model.createdAt', 'model.updatedAt',
        'vehicle.id', 'vehicle.title', 'vehicle.slug',
        'brand.id', 'brand.title', 'brand.slug',
        'product.id', 'product.title', 'product.slug',
        'plan.id', 'plan.durationMonths', 'plan.monthlyAmount',
        'plan.totalInstallments', 'plan.isHighlighted', 'plan.isActive',
      ]);

    if (search && search.length >= 2) {
      qb.andWhere('(model.title ILIKE :search OR model.slug ILIKE :search)', { search: `%${search}%` });
    }

    if (vehicleId) {
      qb.andWhere('model.vehicle_id = :vehicleId', { vehicleId });
    }

    if (brandId) {
      qb.andWhere('vehicle.brand_id = :brandId', { brandId });
    }

    if (year) {
      qb.andWhere('model.year = :year', { year });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('model.isFeatured = :isFeatured', { isFeatured });
    }

    if (isActive !== undefined) {
      qb.andWhere('model.isActive = :isActive', { isActive });
    }

    if (minPrice !== undefined) {
      qb.andWhere('model.totalPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('model.totalPrice <= :maxPrice', { maxPrice });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'order', 'title', 'year', 'totalPrice'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(`model.${safeSortBy}`, safeSortOrder)
      .addOrderBy('plan.durationMonths', 'ASC');

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
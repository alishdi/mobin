import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { Brand } from '../../database/entities/product/brand.entity'; 
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  // ==================== Public ====================

  async findActiveByBrandSlug(
    brandSlug: string,
    filter: VehicleFilterDto,
  ): Promise<PaginatedResponseDto<Vehicle>> {
    const {
      page = 1, limit = 12, sortBy = 'order', sortOrder = 'ASC',
      search, year, isFeatured, isActive = true,
      minPrice, maxPrice, minMonthlyAmount, maxMonthlyAmount,
      dateFrom, dateTo,
    } = filter;

    const brand = await this.brandRepo.findOne({
      where: { slug: brandSlug, isActive: true },
      relations: { product: true },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.product', 'product')
      .leftJoinAndSelect('vehicle.models', 'model', 'model.isActive = :modelActive', { modelActive: true })
      .leftJoinAndSelect('model.installmentPlans', 'plan', 'plan.isActive = :planActive', { planActive: true })
      .where('vehicle.brand_id = :brandId', { brandId: brand.id })
      .andWhere('vehicle.isActive = :isActive', { isActive })
      .select([
        'vehicle.id', 'vehicle.title', 'vehicle.slug', 'vehicle.description',
        'vehicle.imageUrl', 'vehicle.order', 'vehicle.isFeatured',
        'vehicle.viewCount', 'vehicle.createdAt', 'vehicle.updatedAt',
        'brand.id', 'brand.title', 'brand.slug',
        'product.id', 'product.title', 'product.slug',
        'model.id', 'model.title', 'model.slug', 'model.year',
        'model.mileage', 'model.firstDownPayment', 'model.totalPrice',
        'model.imageUrl', 'model.isFeatured', 'model.order', 'model.isActive',
        'plan.id', 'plan.durationMonths', 'plan.monthlyAmount',
        'plan.totalInstallments', 'plan.isHighlighted', 'plan.isActive',
      ]);

    // ✅ فیلترهای پیشرفته
    if (search && search.length >= 2) {
      qb.andWhere('(vehicle.title ILIKE :search OR vehicle.description ILIKE :search)', { search: `%${search}%` });
    }

    if (year) {
      qb.andWhere('model.year = :year', { year });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('vehicle.isFeatured = :isFeatured', { isFeatured });
    }

    if (minPrice !== undefined) {
      qb.andWhere('model.totalPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('model.totalPrice <= :maxPrice', { maxPrice });
    }

    if (minMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount >= :minMonthlyAmount', { minMonthlyAmount });
    }

    if (maxMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount <= :maxMonthlyAmount', { maxMonthlyAmount });
    }

    if (dateFrom) {
      qb.andWhere('vehicle.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('vehicle.createdAt <= :dateTo', { dateTo });
    }

    // ✅ مرتب‌سازی امن
    const validSortFields = ['order', 'title', 'createdAt', 'updatedAt', 'viewCount'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'order';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(`vehicle.${safeSortBy}`, safeSortOrder)
      .addOrderBy('model.order', 'ASC')
      .addOrderBy('plan.durationMonths', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [vehicles, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(vehicles, total, page, limit);
  }

  async findBySlug(slug: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { slug, isActive: true },
      relations: { brand: { product: true }, models: { installmentPlans: true } },
    });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');
    await this.vehicleRepo.increment({ id: vehicle.id }, 'viewCount', 1);
    return vehicle;
  }

  async findFeatured(limit: number = 8): Promise<Partial<Vehicle>[]> {
    return this.vehicleRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: { brand: { product: true } },
      select: {
        id: true, title: true, slug: true, imageUrl: true,
        isFeatured: true, order: true,
        brand: { id: true, title: true, slug: true, product: { id: true, title: true, slug: true } },
      },
      order: { order: 'ASC' },
      take: limit,
    });
  }

  async search(query: string, limit: number = 10): Promise<Partial<Vehicle>[]> {
    if (!query || query.length < 2) return [];
    const searchPattern = `%${query}%`;

    return this.vehicleRepo.find({
      where: [
        { title: searchPattern, isActive: true },
        { description: searchPattern, isActive: true },
      ],
      relations: { brand: { product: true } },
      select: {
        id: true, title: true, slug: true, imageUrl: true, order: true,
        brand: { id: true, title: true, slug: true, product: { id: true, title: true, slug: true } },
      },
      order: { order: 'ASC' },
      take: limit,
    });
  }

  // ==================== Admin ====================

  async findAllForAdmin(q: VehicleFilterDto): Promise<PaginatedResponseDto<Vehicle>> {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      search, productId, brandId, modelId, year, isFeatured, isActive,
      minPrice, maxPrice, minMonthlyAmount, maxMonthlyAmount,
      dateFrom, dateTo,
    } = q;

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.product', 'product')
      .leftJoinAndSelect('vehicle.models', 'model', 'model.isActive = :modelActive', { modelActive: true })
      .leftJoinAndSelect('model.installmentPlans', 'plan', 'plan.isActive = :planActive', { planActive: true })
      .select([
        'vehicle.id', 'vehicle.title', 'vehicle.slug', 'vehicle.description',
        'vehicle.imageUrl', 'vehicle.order', 'vehicle.viewCount',
        'vehicle.isActive', 'vehicle.isFeatured',
        'vehicle.createdAt', 'vehicle.updatedAt',
        'brand.id', 'brand.title', 'brand.slug',
        'product.id', 'product.title', 'product.slug',
        'model.id', 'model.title', 'model.slug', 'model.year',
        'model.mileage', 'model.firstDownPayment', 'model.totalPrice',
        'model.imageUrl', 'model.isFeatured', 'model.order', 'model.isActive',
        'plan.id', 'plan.durationMonths', 'plan.monthlyAmount',
        'plan.totalInstallments', 'plan.isHighlighted', 'plan.isActive',
      ]);

    // ✅ فیلترهای پیشرفته
    if (search && search.length >= 2) {
      qb.andWhere('(vehicle.title ILIKE :search OR vehicle.description ILIKE :search)', { search: `%${search}%` });
    }

    if (productId) {
      qb.andWhere('brand.product_id = :productId', { productId });
    }

    if (brandId) {
      qb.andWhere('vehicle.brand_id = :brandId', { brandId });
    }

    if (modelId) {
      qb.andWhere('model.id = :modelId', { modelId });
    }

    if (year) {
      qb.andWhere('model.year = :year', { year });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('vehicle.isFeatured = :isFeatured', { isFeatured });
    }

    if (isActive !== undefined) {
      qb.andWhere('vehicle.isActive = :isActive', { isActive });
    }

    if (minPrice !== undefined) {
      qb.andWhere('model.totalPrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('model.totalPrice <= :maxPrice', { maxPrice });
    }

    if (minMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount >= :minMonthlyAmount', { minMonthlyAmount });
    }

    if (maxMonthlyAmount !== undefined) {
      qb.andWhere('plan.monthlyAmount <= :maxMonthlyAmount', { maxMonthlyAmount });
    }

    if (dateFrom) {
      qb.andWhere('vehicle.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('vehicle.createdAt <= :dateTo', { dateTo });
    }

    const validSortFields = ['createdAt', 'updatedAt', 'order', 'title', 'viewCount'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(`vehicle.${safeSortBy}`, safeSortOrder)
      .addOrderBy('model.order', 'ASC')
      .addOrderBy('plan.durationMonths', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: { brand: { product: true }, models: { installmentPlans: true } },
    });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');
    return vehicle;
  }

  async create(brandId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('برند والد یافت نشد');
    const exists = await this.vehicleRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    const saved = await this.vehicleRepo.save(this.vehicleRepo.create({ ...dto, brand }));
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
    await this.cacheClearService.clearByPattern('cache:*brands*');
    return saved;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');
    if (dto.slug && dto.slug !== vehicle.slug) {
      const exists = await this.vehicleRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }
    Object.assign(vehicle, dto);
    const saved = await this.vehicleRepo.save(vehicle);
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
    await this.cacheClearService.clearByPattern('cache:*brands*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');
    await this.vehicleRepo.remove(vehicle);
    await this.cacheClearService.clearByPattern('cache:*vehicles*');
    await this.cacheClearService.clearByPattern('cache:*brands*');
  }
}
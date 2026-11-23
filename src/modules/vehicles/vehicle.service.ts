import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';
import { Brand } from '../../database/entities/category/brand.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly cacheClearService: CacheClearService,
  ) { }

  async findActiveByBrandSlug(brandSlug: string, filter: VehicleFilterDto): Promise<any> {
    const { page = 1, limit = 12, sortBy = 'order', sortOrder = 'ASC' } = filter;
    const skip = (page - 1) * limit;

    const brand = await this.brandRepo.findOne({ where: { slug: brandSlug, isActive: true } });
    if (!brand) throw new NotFoundException('برند یافت نشد');

    const [vehicles, total] = await this.vehicleRepo.findAndCount({
      where: { brand: { id: brand.id }, isActive: true },
      relations: { brand: true },
      select: { id: true, title: true, slug: true, description: true, imageUrl: true, order: true, isFeatured: true },
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return PaginatedResponseDto.create(vehicles, total, page, limit);
  }

  async findBySlug(slug: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { slug, isActive: true },
      relations: { brand: { category: true }, models: true },
    });
    if (!vehicle) throw new NotFoundException('خودرو یافت نشد');
    await this.vehicleRepo.increment({ id: vehicle.id }, 'viewCount', 1);
    return vehicle;
  }

  async findFeatured(q: PaginationQueryDto): Promise<PaginatedResponseDto<Vehicle>> {
    const { page = 1, limit = 8 } = q;

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .where('vehicle.isFeatured = :featured', { featured: true })
      .andWhere('vehicle.isActive = :active', { active: true })
      .select([
        'vehicle.id',
        'vehicle.title',
        'vehicle.slug',
        'vehicle.imageUrl',
        'vehicle.isFeatured',
        'vehicle.order',
        'brand.id',
        'brand.title',
        'brand.slug',
      ])
      .orderBy('vehicle.order', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async search(q: PaginationQueryDto & { query?: string }): Promise<PaginatedResponseDto<Vehicle>> {
    const { page = 1, limit = 10, query } = q;
    const searchTerm = query?.trim();

    if (!searchTerm || searchTerm.length < 2) {
      return PaginatedResponseDto.create([], 0, page, limit);
    }

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .where('vehicle.isActive = :active', { active: true })
      .select([
        'vehicle.id',
        'vehicle.title',
        'vehicle.slug',
        'vehicle.imageUrl',
        'vehicle.order',
        'brand.id',
        'brand.title',
        'brand.slug',
      ]);

    const regexPattern = `(^|\\s)${searchTerm}(\\s|$)`;
    qb.andWhere(
      '(vehicle.title ~* :pattern OR vehicle.description ~* :pattern)',
      { pattern: regexPattern },
    );

    qb.orderBy('vehicle.order', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<Vehicle>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search } = q;
    const searchTerm = search?.trim();

    const qb = this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.brand', 'brand')
      .leftJoinAndSelect('brand.category', 'category')
      .select([
        'vehicle.id', 'vehicle.title', 'vehicle.slug', 'vehicle.description',
        'vehicle.imageUrl', 'vehicle.order', 'vehicle.viewCount',
        'vehicle.isActive', 'vehicle.isFeatured', 'vehicle.createdAt', 'vehicle.updatedAt',
        'brand.id', 'brand.title', 'brand.slug',
        'category.id', 'category.title', 'category.slug',
      ]);

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter(w => w.length >= 2);

      if (words.length > 0) {
        const conditions = words.map((word, index) => {
          return `(vehicle.title ILIKE :word${index} OR vehicle.slug ILIKE :word${index} OR vehicle.description ILIKE :word${index})`;
        });

        const params = words.reduce((acc, word, index) => {
          acc[`word${index}`] = `%${word}%`;
          return acc;
        }, {});

        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'order', 'title', 'viewCount'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`vehicle.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: { brand: { category: true }, models: true },
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
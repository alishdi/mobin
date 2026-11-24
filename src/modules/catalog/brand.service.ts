import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../database/entities/product/brand.entity'; 
import { Product } from '../../database/entities/product/product.entity'; 
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandFilterDto } from './dto/brand-filter.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';
import { Vehicle } from '../../database/entities/vehicles/vehicle.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,

    private readonly cacheClearService: CacheClearService,
  ) {}

  // ==================== Public ====================

  async findActiveByProductSlug(slug: string, filter: BrandFilterDto): Promise<PaginatedResponseDto<Brand>> {
    const { page = 1, limit = 20, isActive = true } = filter;

    const product = await this.productRepo.findOne({ where: { slug, isActive: true } });
    if (!product) throw new NotFoundException('دسته‌بندی یافت نشد');

    const qb = this.brandRepo
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.product', 'product')
      .where('brand.product_id = :productId', { productId: product.id })
      .andWhere('brand.isActive = :isActive', { isActive })
      .select([
        'brand.id', 'brand.title', 'brand.slug', 'brand.logoUrl',
        'brand.description', 'brand.order', 'brand.isActive',
        'brand.createdAt', 'brand.updatedAt',
        'product.id', 'product.title', 'product.slug',
      ])
      .orderBy('brand.order', 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(data, total, page, limit);
  }
  async findBrandPage(slug: string): Promise<any> {
    const brand = await this.brandRepo.findOne({
      where: { slug, isActive: true },
      relations: { product: true },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');

    const vehicles = await this.vehicleRepo.find({
      where: { brand: { id: brand.id }, isActive: true },
      relations: { models: { installmentPlans: true } },
      order: { order: 'ASC' },
    });

    const formattedVehicles = vehicles.map((v) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      description: v.description,
      imageUrl: v.imageUrl,
      anchor: `vehicle-${v.id}`,
      models: (v.models || [])
        .filter((m) => m.isActive)
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          id: m.id,
          title: m.title,
          slug: m.slug,
          year: m.year,
          mileage: m.mileage,
          imageUrl: m.imageUrl,
          isFeatured: m.isFeatured,
          anchor: `model-${m.id}`,
          // ✅ تمام اطلاعات مالی اکنون از داخل آرایه installmentPlans خوانده می‌شود
          installmentPlans: (m.installmentPlans || [])
            .filter((p) => p.isActive)
            .sort((a, b) => a.durationMonths - b.durationMonths)
            .map((p) => ({
              id: p.id,
              durationMonths: p.durationMonths,
              monthlyAmount: p.monthlyAmount,
              totalInstallments: p.totalInstallments,
              firstDownPayment: p.firstDownPayment, // ✅ از Plan خوانده می‌شود
              totalPrice: p.totalPrice,             // ✅ از Plan خوانده می‌شود
              secondDownPaymentMonth: p.secondDownPaymentMonth, // ✅ فرمول داینامیک
              isHighlighted: p.isHighlighted,
            })),
        })),
    }));

    return {
      brand: {
        id: brand.id, title: brand.title, slug: brand.slug,
        logoUrl: brand.logoUrl, description: brand.description,
        product: { id: brand.product.id, title: brand.product.title, slug: brand.product.slug },
      },
      vehicles: formattedVehicles,
    };
  }
  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { slug },
      relations: { product: true },
      select: {
        id: true, title: true, slug: true, logoUrl: true,
        description: true, order: true, isActive: true,
        product: { id: true, title: true, slug: true },
      },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    return brand;
  }

  // ==================== Admin ====================

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<Brand>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search } = q;
    const searchTerm = search?.trim();

    const qb = this.brandRepo
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.product', 'product')
      .select([
        'brand.id', 'brand.title', 'brand.slug', 'brand.logoUrl',
        'brand.description', 'brand.order', 'brand.isActive',
        'brand.createdAt', 'brand.updatedAt',
        'product.id', 'product.title', 'product.slug',
      ]);

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter((w) => w.length >= 2);
      if (words.length > 0) {
        const conditions = words.map((_, i) =>
          `(brand.title ILIKE :w${i} OR brand.slug ILIKE :w${i} OR brand.description ILIKE :w${i})`,
        );
        const params = words.reduce((a, w, i) => ({ ...a, [`w${i}`]: `%${w}%` }), {} as Record<string, string>);
        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const valid = ['createdAt', 'updatedAt', 'order', 'title'];
    qb.orderBy(`brand.${valid.includes(sortBy) ? sortBy : 'createdAt'}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id }, relations: { product: true } });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    return brand;
  }

  async create(productId: string, dto: CreateBrandDto): Promise<Brand> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('دسته‌بندی والد یافت نشد');
    const exists = await this.brandRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    const saved = await this.brandRepo.save(this.brandRepo.create({ ...dto, product }));
    await this.cacheClearService.clearByPattern('cache:*brands*');
    await this.cacheClearService.clearByPattern('cache:*products*');
    return saved;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    if (dto.slug && dto.slug !== brand.slug) {
      const exists = await this.brandRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }
    Object.assign(brand, dto);
    const saved = await this.brandRepo.save(brand);
    await this.cacheClearService.clearByPattern('cache:*brands*');
    await this.cacheClearService.clearByPattern('cache:*products*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    await this.brandRepo.remove(brand);
    await this.cacheClearService.clearByPattern('cache:*brands*');
    await this.cacheClearService.clearByPattern('cache:*products*');
  }
}
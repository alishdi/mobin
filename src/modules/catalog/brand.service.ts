import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../database/entities/category/brand.entity';
import { Category } from '../../database/entities/category/category.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'order', 'title'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async findActiveByCategorySlug(
    slug: string,
    q: AdminPaginationDto,
  ): Promise<PaginatedResponseDto<Partial<Brand>>> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      select: { id: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    const qb = this.brandRepo
      .createQueryBuilder('brand')
      .select([
        'brand.id', 'brand.title', 'brand.slug', 'brand.logoUrl',
        'brand.icon', 'brand.order',
      ])
      .where('brand.category_id = :categoryId', { categoryId: category.id })
      .andWhere('brand.isActive = :active', { active: true });

    this.applySearch(qb, q.search);

    qb.orderBy('brand.order', 'ASC')
      .skip(q.skip)  // ✅ امن شد
      .take(q.limit);

    const [brands, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(brands, total, q.page, q.limit);
  }

  async findBySlug(slug: string): Promise<Partial<Brand>> {
    const brand = await this.brandRepo.findOne({
      where: { slug, isActive: true }, // ✅ فقط فعال‌ها
      select: {
        id: true, title: true, slug: true, logoUrl: true,
        description: true, order: true,
      },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    return brand;
  }

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<Brand>> {
    const { page, limit, sortBy, sortOrder, search } = q;

    const qb = this.brandRepo
      .createQueryBuilder('brand')
      .leftJoin('brand.category', 'category') 
      .addSelect([
        'category.id', 'category.title', 'category.slug',
      ])
      .select([
        'brand.id', 'brand.title', 'brand.slug', 'brand.logoUrl',
        'brand.description', 'brand.order', 'brand.isActive',
        'brand.createdAt', 'brand.updatedAt',
      ]);

    this.applySearch(qb, search);

    const safeSortBy: SortField = (VALID_SORT_FIELDS as readonly string[]).includes(sortBy)
      ? (sortBy as SortField)
      : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`brand.${safeSortBy}`, safeSortOrder)
      .skip(q.skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');
    return brand;
  }

  async create(categoryId: string, dto: CreateBrandDto): Promise<Brand> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      select: { id: true, title: true, slug: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی والد یافت نشد');

    const exists = await this.brandRepo.findOne({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');

    const saved = await this.brandRepo.save(this.brandRepo.create({ ...dto, category }));
    await this.clearCache();
    return saved;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('برند یافت نشد');

    if (dto.slug && dto.slug !== brand.slug) {
      const exists = await this.brandRepo.findOne({
        where: { slug: dto.slug },
        select: { id: true },
      });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }

    const allowed: (keyof UpdateBrandDto)[] = [
      'title', 'slug', 'logoUrl', 'description', 'order', 'isActive',
    ];
    for (const key of allowed) {
      if (dto[key] !== undefined) {
        (brand as any)[key] = dto[key];
      }
    }

    const saved = await this.brandRepo.save(brand);
    await this.clearCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandRepo.findOne({
      where: { id },
      select: { id: true },
    });
    if (!brand) throw new NotFoundException('برند یافت نشد');

    await this.brandRepo.remove(brand);
    await this.clearCache();
  }

  private applySearch(qb: any, search?: string): void {
    const term = search?.trim();
    if (!term || term.length < 2) return;

    const words = [...new Set(term.split(/\s+/).filter((w) => w.length >= 2))];
    if (words.length === 0) return;

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    words.forEach((word, i) => {
      const key = `brandWord${i}`;
      conditions.push(
        `(brand.title ILIKE :${key} OR brand.slug ILIKE :${key} OR brand.description ILIKE :${key})`,
      );
      params[key] = `%${word}%`;
    });

    qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  private async clearCache(): Promise<void> {
    await this.cacheClearService.clearByPattern('cache:*brands*');
    await this.cacheClearService.clearByPattern('cache:*categories*');
  }
}
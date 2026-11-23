import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'order', 'title'] as const;
type SortField = typeof VALID_SORT_FIELDS[number];

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async findActiveList(): Promise<Partial<Category>[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, imageUrl: true, icon: true, order: true },
      order: { order: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Partial<Category>> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true }, 
      select: {
        id: true, title: true, slug: true, description: true,
        imageUrl: true, icon: true, order: true,
      },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<Category>> {
    const { page, limit, sortBy, sortOrder, search } = q;

    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .select([
        'category.id', 'category.title', 'category.slug', 'category.description',
        'category.imageUrl', 'category.icon', 'category.order',
        'category.isActive', 'category.createdAt', 'category.updatedAt',
      ]);

    this.applySearch(qb, search);

    const safeSortBy: SortField = (VALID_SORT_FIELDS as readonly string[]).includes(sortBy)
      ? (sortBy as SortField)
      : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`category.${safeSortBy}`, safeSortOrder)
      .skip(q.skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { brands: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');

    const saved = await this.categoryRepo.save(this.categoryRepo.create(dto));
    await this.clearCache();
    return saved;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    if (dto.slug && dto.slug !== category.slug) {
      const exists = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }

    const allowed: (keyof UpdateCategoryDto)[] = [
      'title', 'slug', 'description', 'imageUrl', 'icon', 'order', 'isActive',
    ];
    for (const key of allowed) {
      if (dto[key] !== undefined) {
        (category as any)[key] = dto[key];
      }
    }

    const saved = await this.categoryRepo.save(category);
    await this.clearCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { brands: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    const activeBrands = category.brands?.filter((b) => b.isActive).length ?? 0;
    if (activeBrands > 0) {
      throw new BadRequestException(`این دسته‌بندی دارای ${activeBrands} برند فعال است`);
    }

    await this.categoryRepo.remove(category);
    await this.clearCache();
  }

  private applySearch(qb: ReturnType<Repository<Category>['createQueryBuilder']>, search?: string): void {
    const term = search?.trim();
    if (!term || term.length < 2) return;

    const words = [...new Set(term.split(/\s+/).filter((w) => w.length >= 2))];
    if (words.length === 0) return;

    const conditions: string[] = [];
    const params: Record<string, string> = {};

    words.forEach((word, i) => {
      const key = `catWord${i}`;
      conditions.push(
        `(category.title ILIKE :${key} OR category.slug ILIKE :${key} OR category.description ILIKE :${key})`,
      );
      params[key] = `%${word}%`;
    });

    qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  private async clearCache(): Promise<void> {
    await this.cacheClearService.clearByPattern('cache:*categories*');
    await this.cacheClearService.clearByPattern('cache:*brands*');
  }
}
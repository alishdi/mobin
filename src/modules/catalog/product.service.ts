import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product/product.entity';
import { Brand } from '../../database/entities/product/brand.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
    private readonly cacheClearService: CacheClearService,
  ) { }

  // ==================== Public ====================

  async findActiveList(): Promise<Partial<Product>[]> {
    return this.productRepo.find({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, imageUrl: true, icon: true, order: true },
      order: { order: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug },
      select: { id: true, title: true, slug: true, description: true, imageUrl: true, icon: true, order: true },
    });
    if (!product) throw new NotFoundException('دسته‌بندی یافت نشد');
    return product;
  }

  // ==================== Admin ====================

  async findAllForAdmin(q: AdminPaginationDto & { isActive?: boolean }): Promise<PaginatedResponseDto<Product>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, isActive } = q;
    const searchTerm = search?.trim();

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brands', 'brands')
      .select([
        'product.id', 'product.title', 'product.slug', 'product.description',
        'product.imageUrl', 'product.icon', 'product.order', 'product.isActive',
        'product.createdAt', 'product.updatedAt',
      ]);

    if (isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive });
    }

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter((w) => w.length >= 2);
      if (words.length > 0) {
        const conditions = words.map((_, i) =>
          `(product.title ILIKE :w${i} OR product.slug ILIKE :w${i} OR product.description ILIKE :w${i})`,
        );
        const params = words.reduce((a, w, i) => ({ ...a, [`w${i}`]: `%${w}%` }), {} as Record<string, string>);
        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const valid = ['createdAt', 'updatedAt', 'order', 'title'];
    qb.orderBy(`product.${valid.includes(sortBy) ? sortBy : 'createdAt'}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id }, relations: { brands: true } });
    if (!product) throw new NotFoundException('دسته‌بندی یافت نشد');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.productRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    const saved = await this.productRepo.save(this.productRepo.create(dto));
    await this.cacheClearService.clearByPattern('cache:*products*');
    return saved;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('دسته‌بندی یافت نشد');
    if (dto.slug && dto.slug !== product.slug) {
      const exists = await this.productRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('این slug قبلاً استفاده شده است');
    }
    Object.assign(product, dto);
    const saved = await this.productRepo.save(product);
    await this.cacheClearService.clearByPattern('cache:*products*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id }, relations: { brands: true } });
    if (!product) throw new NotFoundException('دسته‌بندی یافت نشد');
    const active = product.brands?.filter((b) => b.isActive).length ?? 0;
    if (active > 0) throw new BadRequestException(`این دسته دارای ${active} برند فعال است`);
    await this.productRepo.remove(product);
    await this.cacheClearService.clearByPattern('cache:*products*');
  }
}
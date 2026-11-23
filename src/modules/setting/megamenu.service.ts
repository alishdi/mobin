import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Megamenu } from '../../database/entities/menu/mega-menu.entity';
import { Submenu } from '../../database/entities/menu/sub-menu.entity';
import { CreateMegamenuDto } from './dto/menu/create-mega-menu.dto';
import { UpdateMegamenuDto } from './dto/menu/update-mega-menu.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class MegamenuService {
  constructor(
    @InjectRepository(Megamenu) private readonly megamenuRepo: Repository<Megamenu>,
    @InjectRepository(Submenu) private readonly submenuRepo: Repository<Submenu>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async findAllBySubmenu(submenuId: string, q: AdminPaginationDto): Promise<PaginatedResponseDto<Megamenu>> {
    const submenu = await this.submenuRepo.findOne({ where: { id: submenuId } });
    if (!submenu) throw new NotFoundException('ساب‌منوی والد یافت نشد');

    let where: any = { submenu: { id: submenuId } };

    if (q.search) {
      const searchPattern = ILike(`%${q.search}%`);
      where = [
        { title: searchPattern, submenu: { id: submenuId } },
        { url: searchPattern, submenu: { id: submenuId } },
      ];
    }

    const [data, total] = await this.megamenuRepo.findAndCount({
      where,
      select: {
        id: true, title: true, url: true, icon: true, description: true,
        order: true, isActive: true, openInNewTab: true,
        createdAt: true, updatedAt: true,
      },
      order: { [q.sortBy || 'order']: q.sortOrder || 'ASC' },
      skip: q.skip,
      take: q.limit,
    });

    return PaginatedResponseDto.create(data, total, q.page!, q.limit!);
  }

  async findOne(id: string): Promise<Megamenu> {
    const megamenu = await this.megamenuRepo.findOne({
      where: { id },
      relations: { submenu: true },
    });
    if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');
    return megamenu;
  }

  async create(submenuId: string, dto: CreateMegamenuDto): Promise<Megamenu> {
    const submenu = await this.submenuRepo.findOne({ where: { id: submenuId } });
    if (!submenu) throw new NotFoundException('ساب‌منوی والد یافت نشد');

    const saved = await this.megamenuRepo.save(this.megamenuRepo.create({ ...dto, submenu }));
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
    await this.cacheClearService.clearByPattern('cache:*megamenus*');
    return saved;
  }

  async update(id: string, dto: UpdateMegamenuDto): Promise<Megamenu> {
    const megamenu = await this.megamenuRepo.findOne({ where: { id } });
    if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');

    Object.assign(megamenu, dto);
    const saved = await this.megamenuRepo.save(megamenu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
    await this.cacheClearService.clearByPattern('cache:*megamenus*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const megamenu = await this.megamenuRepo.findOne({ where: { id } });
    if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');

    await this.megamenuRepo.remove(megamenu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
    await this.cacheClearService.clearByPattern('cache:*megamenus*');
  }
}
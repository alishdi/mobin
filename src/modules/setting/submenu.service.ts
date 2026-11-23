import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Submenu } from '../../database/entities/menu/sub-menu.entity';
import { Menu } from '../../database/entities/menu/menu.entity';
import { CreateSubmenuDto } from './dto/menu/create-sub-menu.dto'; 
import { UpdateSubmenuDto } from './dto/menu/update-sub-menu.dto'; 
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class SubmenuService {
  constructor(
    @InjectRepository(Submenu) private readonly submenuRepo: Repository<Submenu>,
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async findAllByMenu(menuId: string, q: AdminPaginationDto): Promise<PaginatedResponseDto<Submenu>> {
    const menu = await this.menuRepo.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('منوی والد یافت نشد');

    let where: any = { menu: { id: menuId } };

    if (q.search) {
      const searchPattern = ILike(`%${q.search}%`);
      where = [
        { title: searchPattern, menu: { id: menuId } },
        { url: searchPattern, menu: { id: menuId } },
      ];
    }

    const [data, total] = await this.submenuRepo.findAndCount({
      where,
      relations: { megamenus: true },
      select: {
        id: true, title: true, url: true, icon: true,
        order: true, isActive: true, openInNewTab: true,
        createdAt: true, updatedAt: true,
      },
      order: { [q.sortBy || 'order']: q.sortOrder || 'ASC' },
      skip: q.skip,
      take: q.limit,
    });

    return PaginatedResponseDto.create(data, total, q.page!, q.limit!);
  }

  async findOne(id: string): Promise<Submenu> {
    const submenu = await this.submenuRepo.findOne({
      where: { id },
      relations: { megamenus: true, menu: true },
    });
    if (!submenu) throw new NotFoundException('ساب‌منو یافت نشد');
    return submenu;
  }

  async create(menuId: string, dto: CreateSubmenuDto): Promise<Submenu> {
    const menu = await this.menuRepo.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('منوی والد یافت نشد');

    const saved = await this.submenuRepo.save(this.submenuRepo.create({ ...dto, menu }));
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
    return saved;
  }

  async update(id: string, dto: UpdateSubmenuDto): Promise<Submenu> {
    const submenu = await this.submenuRepo.findOne({ where: { id } });
    if (!submenu) throw new NotFoundException('ساب‌منو یافت نشد');

    Object.assign(submenu, dto);
    const saved = await this.submenuRepo.save(submenu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const submenu = await this.submenuRepo.findOne({ where: { id } });
    if (!submenu) throw new NotFoundException('ساب‌منو یافت نشد');

    await this.submenuRepo.remove(submenu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
    await this.cacheClearService.clearByPattern('cache:*submenus*');
  }
}
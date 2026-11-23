import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Menu } from '../../database/entities/menu/menu.entity';
import { CreateMenuDto } from './dto/menu/create-menu.dto';
import { UpdateMenuDto } from './dto/menu/update-menu.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  async getFullTree(): Promise<Menu[]> {
    const menus = await this.menuRepo.find({
      where: { isActive: true },
      relations: { submenus: { megamenus: true } },
      order: { order: 'ASC' },
    });

    return menus.map(menu => ({
      ...menu,
      submenus: menu.submenus
        .filter(s => s.isActive)
        .map(s => ({ ...s, megamenus: s.megamenus.filter(m => m.isActive) })),
    }));
  }

  async findAllForAdmin(q: AdminPaginationDto): Promise<PaginatedResponseDto<Menu>> {
    let where: any = {};

    if (q.search) {
      const searchPattern = ILike(`%${q.search}%`);
      where = [{ title: searchPattern }, { url: searchPattern }];
    }

    const [data, total] = await this.menuRepo.findAndCount({
      where,
      relations: { submenus: { megamenus: true } },
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

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepo.findOne({
      where: { id },
      relations: { submenus: { megamenus: true } },
    });
    if (!menu) throw new NotFoundException('منو یافت نشد');
    return menu;
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    const saved = await this.menuRepo.save(this.menuRepo.create(dto));
    await this.cacheClearService.clearByPattern('cache:*menus*');
    return saved;
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('منو یافت نشد');

    Object.assign(menu, dto);
    const saved = await this.menuRepo.save(menu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
    return saved;
  }

  async remove(id: string): Promise<void> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('منو یافت نشد');

    await this.menuRepo.remove(menu);
    await this.cacheClearService.clearByPattern('cache:*menus*');
  }
}
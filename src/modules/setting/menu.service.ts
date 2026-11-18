import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { Menu } from '../../database/entities/menu.entity';
import { CreateMenuDto } from './dto/menu/create-menu.dto';
import { UpdateMenuDto } from './dto/menu/update-menu.dto';

@Injectable()
export class MenuService {
    private readonly CACHE_PREFIX = 'menus:';
    private readonly CACHE_TTL = 3600;

    constructor(
        @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    async findAll(): Promise<Menu[]> {
        return this.menuRepo.find({
            relations: { submenus: { megamenus: true } },
            order: { order: 'ASC' },
        });
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
        const menu = this.menuRepo.create(dto);
        const saved = await this.menuRepo.save(menu);
        await this.clearMenuCache();
        return saved;
    }

    async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
        const menu = await this.menuRepo.findOne({ where: { id } });
        if (!menu) throw new NotFoundException('منو یافت نشد');
        Object.assign(menu, dto);
        const saved = await this.menuRepo.save(menu);
        await this.clearMenuCache();
        return saved;
    }

    async remove(id: string): Promise<void> {
        const menu = await this.menuRepo.findOne({ where: { id } });
        if (!menu) throw new NotFoundException('منو یافت نشد');
        await this.menuRepo.remove(menu);
        await this.clearMenuCache();
    }

    async getFullTree(): Promise<Menu[]> {
        const cacheKey = `${this.CACHE_PREFIX}tree`;
        const cached = await this.cacheManager.get<Menu[]>(cacheKey);
        if (cached) return cached;

        const menus = await this.menuRepo.find({
            where: { isActive: true },
            relations: { submenus: { megamenus: true } },
            order: { order: 'ASC' },
        });

        // ✅ این خط را اضافه کنید تا خروجی خام دیتابیس را ببینید
        console.log('🔍 [DEBUG] Raw Menus from DB:', JSON.stringify(menus.map(m => ({ id: m.id, title: m.title, submenusCount: m.submenus?.length }))));

        const filtered = menus.map(menu => ({
            ...menu,
            submenus: menu.submenus
                ? menu.submenus.filter(s => s.isActive).map(s => ({
                    ...s,
                    megamenus: s.megamenus ? s.megamenus.filter(m => m.isActive) : [],
                }))
                : [],
        }));

        await this.cacheManager.set(cacheKey, filtered, this.CACHE_TTL);
        return filtered;
    }

    private async clearMenuCache(): Promise<void> {
        await this.cacheManager.del(`${this.CACHE_PREFIX}tree`);
    }
}
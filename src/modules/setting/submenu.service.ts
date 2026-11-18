import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submenu } from 'src/database/entities/sub-menu.entity';
import { Menu } from '../../database/entities/menu.entity';
import { CreateSubmenuDto } from './dto/menu/create-sub-menu.dto';
import { UpdateSubmenuDto } from './dto/menu/update-sub-menu.dto';
import { MenuService } from './menu.service';

@Injectable()
export class SubmenuService {
    constructor(
        @InjectRepository(Submenu) private readonly submenuRepo: Repository<Submenu>,
        @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
        private readonly menuService: MenuService,
    ) { }

    async findAllByMenu(menuId: string): Promise<Submenu[]> {
        const menu = await this.menuRepo.findOne({ where: { id: menuId } });
        if (!menu) throw new NotFoundException('منوی والد یافت نشد');

        return this.submenuRepo.find({
            where: { menu: { id: menuId } },
            relations: { 'megamenus': true },
            order: { order: 'ASC' },
        });
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

        const submenu = this.submenuRepo.create({
            ...dto,
            menu: menu,
        });

        const saved = await this.submenuRepo.save(submenu);

        await this.menuService['clearMenuCache']();
        return saved;

    }

    async update(id: string, dto: UpdateSubmenuDto): Promise<Submenu> {
        const submenu = await this.submenuRepo.findOne({ where: { id } });
        if (!submenu) throw new NotFoundException('ساب‌منو یافت نشد');

        Object.assign(submenu, dto);
        const saved = await this.submenuRepo.save(submenu);

        await this.menuService['clearMenuCache']();
        return saved;
    }

    async remove(id: string): Promise<void> {
        const submenu = await this.submenuRepo.findOne({ where: { id } });
        if (!submenu) throw new NotFoundException('ساب‌منو یافت نشد');

        await this.submenuRepo.remove(submenu);
        await this.menuService['clearMenuCache']();
    }
}
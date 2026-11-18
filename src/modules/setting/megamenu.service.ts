import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Megamenu } from 'src/database/entities/mega-menu.entity';
import { Submenu } from 'src/database/entities/sub-menu.entity';
import { CreateMegamenuDto } from './dto/menu/create-mega-menu.dto';
import { UpdateMegamenuDto } from './dto/menu/update-mega-menu.dto';
import { MenuService } from './menu.service';

@Injectable()
export class MegamenuService {
    constructor(
        @InjectRepository(Megamenu) private readonly megamenuRepo: Repository<Megamenu>,
        @InjectRepository(Submenu) private readonly submenuRepo: Repository<Submenu>,
        private readonly menuService: MenuService,
    ) { }

    async findAllBySubmenu(submenuId: string): Promise<Megamenu[]> {
        const submenu = await this.submenuRepo.findOne({ where: { id: submenuId } });
        if (!submenu) throw new NotFoundException('ساب‌منوی والد یافت نشد');

        return this.megamenuRepo.find({
            where: { submenu: { id: submenuId } }, 
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Megamenu> {
        const megamenu = await this.megamenuRepo.findOne({
            where: { id },
            relations: { 'submenu': true },
        });
        if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');
        return megamenu;
    }

    async create(submenuId: string, dto: CreateMegamenuDto): Promise<Megamenu> {
        const submenu = await this.submenuRepo.findOne({ where: { id: submenuId } });
        if (!submenu) throw new NotFoundException('ساب‌منوی والد یافت نشد');

        const megamenu = this.megamenuRepo.create({
            ...dto,
            submenu: submenu,
        });

        const saved = await this.megamenuRepo.save(megamenu);

        await this.menuService['clearMenuCache']();
        return saved;
    }

    async update(id: string, dto: UpdateMegamenuDto): Promise<Megamenu> {
        const megamenu = await this.megamenuRepo.findOne({ where: { id } });
        if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');

        Object.assign(megamenu, dto);
        const saved = await this.megamenuRepo.save(megamenu);

        await this.menuService['clearMenuCache']();
        return saved;
    }

    async remove(id: string): Promise<void> {
        const megamenu = await this.megamenuRepo.findOne({ where: { id } });
        if (!megamenu) throw new NotFoundException('مگا منو یافت نشد');

        await this.megamenuRepo.remove(megamenu);
        await this.menuService['clearMenuCache']();
    }
}
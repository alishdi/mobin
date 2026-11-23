import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { Submenu } from './sub-menu.entity';
import { Transform } from 'class-transformer';

@Entity('menus')
export class Menu {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, comment: 'عنوان منوی اصلی' })
    title: string;

    @Column({ type: 'varchar', nullable: true, comment: 'لینک مقصد (اختیاری)' })
    url: string;

    @Column({ type: 'varchar', nullable: true, comment: 'نام آیکون' })
    icon: string;

    @Column({ type: 'varchar', nullable: true, comment: 'توضیحات کوتاه' })
    description: string;

    @Column({ type: 'int', default: 0, comment: 'ترتیب نمایش' })
    @Index()
    order: number;

    @Column({ type: 'boolean', default: true, comment: 'آیا فعال است؟' })
    isActive: boolean;

    @Column({ type: 'boolean', default: false, comment: 'باز شدن در تب جدید' })
    openInNewTab: boolean;

    @OneToMany(() => Submenu, (submenu) => submenu.menu, { cascade: true })
    submenus: Submenu[];

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
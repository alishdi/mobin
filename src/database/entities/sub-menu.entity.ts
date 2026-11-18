import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Menu } from './menu.entity';
import { Megamenu } from './mega-menu.entity';
import { Transform } from 'class-transformer';

@Entity('submenus')
export class Submenu {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'varchar', nullable: true })
    url: string;

    @Column({ type: 'varchar', nullable: true })
    icon: string;

    @Column({ type: 'int', default: 0 })
    @Index()
    order: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    openInNewTab: boolean;

    @ManyToOne(() => Menu, (menu) => menu.submenus, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'menu_id' })
    menu: Menu;

    @OneToMany(() => Megamenu, (megamenu) => megamenu.submenu, {
        cascade: true,
        eager: true,
    })
    megamenus: Megamenu[];

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
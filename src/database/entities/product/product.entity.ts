import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    @Index()
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string;

    @Column({ type: 'varchar', nullable: true })
    icon: string;

    @Column({ type: 'int', default: 0 })
    @Index()
    order: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => Brand, (brand) => brand.product)
    brands: Brand[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
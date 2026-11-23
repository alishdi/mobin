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
import { Brand } from '../category/brand.entity';
import { VehicleModel } from './vehicle-model.entity';

@Index('IDX_vehicle_brand_active_order', ['brand', 'isActive', 'order'])
@Index('IDX_vehicle_featured_active', ['isFeatured', 'isActive'])
@Index('IDX_vehicle_view_count', ['viewCount'])
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, comment: 'نام خودرو (مثل تارا، دنا، شاهین)' })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true, comment: 'تصویر شاخص' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'گالری تصاویر JSON' })
  gallery: string;

  @Column({ type: 'text', nullable: true, comment: 'ویژگی‌ها JSON' })
  features: string;

  @Column({ type: 'int', default: 0 })
  @Index()
  order: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @ManyToOne(() => Brand, (brand) => brand.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => VehicleModel, (model) => model.vehicle)
  models: VehicleModel[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
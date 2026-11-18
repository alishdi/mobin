import { Transform } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: 'برند خودرو' })
  @Index()
  brand: string;

  @Column({ type: 'varchar', length: 100, comment: 'مدل خودرو' })
  model: string;

  @Column({ type: 'int', comment: 'سال ساخت' })
  year: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'قیمت نقدی (تومان)' })
  cashPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'قیمت اقساطی (تومان)' })
  installmentPrice: number;

  @Column({ type: 'int', default: 0, comment: 'موجودی انبار' })
  stock: number;

  @Column({ type: 'varchar', nullable: true, comment: 'لینک تصویر اصلی' })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true, comment: 'آپشن‌های خودرو' })
  options: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: 'آیا برای فروش فعال است؟' })
  isActive: boolean;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
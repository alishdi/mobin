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
import { Vehicle } from './vehicle.entity';
import { InstallmentPlan } from '../installment/installment-plan.entity';

@Index('IDX_model_vehicle_active_order', ['vehicle', 'isActive', 'order'])
@Index('IDX_model_year', ['year'])
@Index('IDX_model_featured_active', ['isFeatured', 'isActive'])
@Entity('vehicle_models')
export class VehicleModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: 'عنوان مدل (مثل V4، توربو، دستی)' })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: 'اسلاگ برای URL' })
  @Index()
  slug: string;

  @Column({ type: 'int', nullable: true, comment: 'سال تولید (مدل)' })
  year: number;

  @Column({ type: 'varchar', nullable: true, comment: 'کارکرد (صفر کیلومتر، ۱۰۰۰۰ کیلومتر)' })
  mileage: string;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'پیش پرداخت اول (موقع خودرو)' })
  firstDownPayment: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true, comment: 'پیش پرداخت دوم (۲ ماهه)' })
  secondDownPayment2Months: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true, comment: 'پیش پرداخت دوم (۷ ماهه)' })
  secondDownPayment7Months: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true, comment: 'قیمت کل خودرو' })
  totalPrice: number;

  @Column({ type: 'varchar', nullable: true, comment: 'تصویر مدل' })
  imageUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'توضیحات مدل' })
  description: string;

  @Column({ type: 'int', default: 0 })
  @Index()
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, comment: 'پیشنهاد ویژه' })
  isFeatured: boolean;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(() => InstallmentPlan, (plan) => plan.model, { cascade: true })
  installmentPlans: InstallmentPlan[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
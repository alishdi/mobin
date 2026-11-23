import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { Transform } from 'class-transformer';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, comment: 'شماره قرارداد' })
  @Index()
  contractNumber: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'پیش‌پرداخت (تومان)' })
  downPayment: number;

  @Column({ type: 'int', comment: 'تعداد اقساط' })
  installmentCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'مبلغ هر قسط (تومان)' })
  installmentAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'نرخ سود سالانه (درصد)' })
  interestRate: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'active', 'completed', 'cancelled'],
    default: 'pending',
    comment: 'وضعیت قرارداد'
  })
  @Index()
  status: string;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @Column({ type: 'date', nullable: true, comment: 'تاریخ شروع قرارداد' })
  startDate: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @Column({ type: 'date', nullable: true, comment: 'تاریخ پایان قرارداد' })
  endDate: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
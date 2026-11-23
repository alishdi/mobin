import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { VehicleModel } from '../vehicles/vehicle-model.entity';

@Index('IDX_plan_model_active_duration', ['model', 'isActive', 'durationMonths'])
@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', comment: 'مدت اقساط (ماه): 12, 24, 36, 48, 60, 72' })
  @Index()
  durationMonths: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'مبلغ هر قسط (تومان)' })
  monthlyAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, nullable: true, comment: 'مجموع اقساط (محاسبه‌شده)' })
  totalInstallments: number;

  @Column({ type: 'boolean', default: false, comment: 'ردیف برجسته (قرمز) در جدول' })
  isHighlighted: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => VehicleModel, (model) => model.installmentPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: VehicleModel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * محاسبه خودکار مجموع اقساط قبل از ذخیره
   */
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    if (this.monthlyAmount && this.durationMonths) {
      this.totalInstallments = Number(this.monthlyAmount) * this.durationMonths;
    }
  }
}
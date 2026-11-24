import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { VehicleModel } from '../vehicles/vehicle-model.entity';

@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  durationMonths: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  monthlyAmount: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  totalInstallments: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  firstDownPayment: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  totalPrice: number;

  @Column({ type: 'int', default: 2 })
  secondDownPaymentMonth: number;

  @Column({ type: 'boolean', default: false })
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
}
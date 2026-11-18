import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Contract } from './contract.entity';
import { Transform } from 'class-transformer';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, comment: 'شناسه یکتای تراکنش' })
  @Index()
  transactionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ type: 'decimal', precision: 15, scale: 0, comment: 'مبلغ پرداختی (تومان)' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: "pending",
    comment: 'وضعیت پرداخت'
  })
  @Index()
  status: string;

  @Column({
    type: 'enum',
    enum: ['down_payment', 'installment', 'late_fee'],
    comment: 'نوع پرداخت'
  })
  paymentType: string;

  @Column({ type: 'int', nullable: true, comment: 'شماره قسط (برای پرداخت اقساط)' })
  installmentNumber: number;

  @Column({ type: 'varchar', nullable: true, comment: 'توضیحات' })
  description: string;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
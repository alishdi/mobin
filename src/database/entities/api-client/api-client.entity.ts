import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('api_clients')
export class ApiClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: 'نام سیستم متصل شونده (مثلاً کارفرما)' })
  name: string;

  @Column({ name: 'api_key_hash', type: 'varchar', length: 128, unique: true })
  @Index()
  apiKeyHash: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
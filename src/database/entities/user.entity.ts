import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Transform } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 15 })
  @Index()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  firstName: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  nationalCode: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true, cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;


  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
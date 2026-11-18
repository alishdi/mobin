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
import { Submenu } from './sub-menu.entity'; 
import { Transform } from 'class-transformer';

@Entity('megamenus')
export class Megamenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  @Index()
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  openInNewTab: boolean;

  @ManyToOne(() => Submenu, (submenu) => submenu.megamenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submenu_id' })
  submenu: Submenu;

@Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;


@Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
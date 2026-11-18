import { Transform } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FooterSection {
  ABOUT = 'about',
  LINKS = 'links',
  CONTACT = 'contact',
  SOCIAL = 'social',
  NEWSLETTER = 'newsletter',
}

@Entity('footers')
export class Footer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum', 
    enum: FooterSection,
    comment: 'بخش فوتر'
  })
  section: FooterSection;

  @Column({ type: 'varchar', length: 100, comment: 'عنوان بخش' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: 'محتوا (JSON برای لینک‌ها یا متن ساده)' })
  content: string;

  @Column({ type: 'int', default: 0, comment: 'ترتیب نمایش' })
  order: number;

  @Column({ type: 'boolean', default: true, comment: 'آیا فعال است؟' })
  isActive: boolean;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FooterSection {
  BRAND = 'brand',           // معرفی + لوگو + تگ‌ها
  INSTALLMENT_BRANDS = 'installment_brands', // جدول اقساط برندها
  VEHICLES = 'vehicles',     // لیست خودروها
  BRANCHES = 'branches',     // شعب مبین خودرو
  CTA = 'cta',               // دکمه درخواست مشاوره
  SOCIAL = 'social',         // شبکه‌های اجتماعی
  COPYRIGHT = 'copyright',   // کپی‌رایت و شماره ثبت
}

@Entity('footers')
export class Footer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FooterSection,
    unique: true,
    comment: 'کلید یکتای بخش فوتر',
  })
  @Index()
  section: FooterSection;

  @Column({ type: 'varchar', length: 100, comment: 'عنوان بخش' })
  title: string;

  @Column({
    type: 'text',
    comment: 'محتوای بخش به صورت JSON ساختاریافته',
  })
  content: string;

  @Column({ type: 'int', default: 0, comment: 'ترتیب نمایش' })
  @Index()
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
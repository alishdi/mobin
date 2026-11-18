import { Transform } from 'class-transformer';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('sliders')
export class Slider {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 200, comment: 'عنوان اسلاید' })
    title: string;

    @Column({ type: 'text', nullable: true, comment: 'توضیحات' })
    description: string;

    @Column({ type: 'varchar', comment: 'لینک تصویر' })
    imageUrl: string;

    @Column({ type: 'varchar', nullable: true, comment: 'لینک مقصد (CTA)' })
    linkUrl: string;

    @Column({ type: 'varchar', nullable: true, length: 50, comment: 'متن دکمه (CTA)' })
    buttonText: string;

    @Column({ type: 'int', default: 0, comment: 'ترتیب نمایش' })
    @Index()
    order: number;

    @Column({ type: 'varchar', length: 100, default: 'home', comment: 'محل نمایش (home, vehicles, etc.)' })
    @Index()
    location: string;

    @Column({ type: 'boolean', default: true, comment: 'آیا فعال است؟' })
    isActive: boolean;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @Column({ type: 'timestamp', nullable: true, comment: 'تاریخ شروع نمایش' })
    startDate: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @Column({ type: 'timestamp', nullable: true, comment: 'تاریخ پایان نمایش' })
    endDate: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
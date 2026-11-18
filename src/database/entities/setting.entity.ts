import { Transform } from 'class-transformer';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum SettingType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    JSON = 'json',
    IMAGE = 'image',
}

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true, length: 100, comment: 'کلید منحصر به فرد تنظیم' })
    @Index()
    key: string;

    @Column({ type: 'varchar', length: 100, comment: 'عنوان نمایشی' })
    displayName: string;

    @Column({ type: 'text', nullable: true, comment: 'مقدار (ممکن است JSON باشد)' })
    value: string;

    @Column({
        type: 'enum',
        enum: SettingType,
        default: SettingType.STRING,
        comment: 'نوع مقدار'
    })
    type: SettingType;

    @Column({ type: 'varchar', nullable: true, comment: 'توضیحات برای ادمین' })
    description: string;

    @Column({ type: 'varchar', length: 100, default: 'general', comment: 'گروه‌بندی (مثل: general, seo, contact)' })
    @Index()
    group: string;

    @Column({ type: 'boolean', default: true, comment: 'آیا برای عموم قابل مشاهده است؟' })
    isPublic: boolean;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
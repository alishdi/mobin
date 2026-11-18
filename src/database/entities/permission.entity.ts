import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Transform } from 'class-transformer';

export enum PermissionResource {
    USERS = 'users',
    ROLES = 'roles',
    VEHICLES = 'vehicles',
    CONTRACTS = 'contracts',
    PAYMENTS = 'payments',
    SETTINGS = 'settings',
    MENUS = 'menus',
    SLIDERS = 'sliders',
    FOOTERS = 'footers',
    REPORTS = 'reports',
    SUBMENUS = 'submenus',     
    MEGAMENUS = 'megamenus',  
}

export enum PermissionAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    EXPORT = 'export',
    APPROVE = 'approve',
}

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: PermissionResource })
    resource: PermissionResource;

    @Column({ type: 'enum', enum: PermissionAction })
    action: PermissionAction;

    @Column({ type: 'varchar', unique: true })
    code: string;

    @Column({ type: 'varchar', length: 100 })
    displayName: string;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
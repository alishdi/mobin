import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RoleName } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
  ) {}

  // ==================== Permissions CRUD ====================
  
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { resource: 'ASC', action: 'ASC' } });
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException('این کد دسترسی قبلاً ثبت شده است');

    const permission = this.permissionRepo.create(dto);
    return this.permissionRepo.save(permission);
  }

  async updatePermission(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('دسترسی مورد نظر یافت نشد');

    Object.assign(permission, dto);
    return this.permissionRepo.save(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('دسترسی مورد نظر یافت نشد');
    
    await this.permissionRepo.remove(permission);
  }

  // ==================== Roles CRUD ====================

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({ 
      relations: { permissions: true },
      order: { name: 'ASC' } 
    });
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ 
      where: { id }, 
      relations: { permissions: true } 
    });
    if (!role) throw new NotFoundException('نقش مورد نظر یافت نشد');
    return role;
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('این نام نقش قبلاً ثبت شده است');

    const role = this.roleRepo.create({
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      isActive: dto.isActive ?? true,
    });

    // ✅ Parse کردن permissionIds از JSON string به آرایه
    if (dto.permissionIds) {
      const permissionIds = this.parsePermissionIds(dto.permissionIds);
      if (permissionIds.length > 0) {
        role.permissions = await this.permissionRepo.findBy({
          id: In(permissionIds),
        });
      }
    }

    return this.roleRepo.save(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepo.findOne({ 
      where: { id }, 
      relations: { permissions: true } 
    });
    if (!role) throw new NotFoundException('نقش مورد نظر یافت نشد');

    if (role.name === RoleName.SUPER_ADMIN && dto.name && dto.name !== RoleName.SUPER_ADMIN) {
      throw new ConflictException('تغییر نام نقش Super Admin مجاز نیست');
    }

    Object.assign(role, dto);

    // ✅ Parse کردن permissionIds از JSON string به آرایه
    if (dto.permissionIds !== undefined) {
      const permissionIds = this.parsePermissionIds(dto.permissionIds);
      role.permissions = await this.permissionRepo.findBy({
        id: In(permissionIds),
      });
    }

    return this.roleRepo.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('نقش مورد نظر یافت نشد');

    if (role.name === RoleName.SUPER_ADMIN) {
      throw new ConflictException('حذف نقش Super Admin مجاز نیست');
    }

    await this.roleRepo.remove(role);
  }

  // ==================== متد کمکی ====================

  private parsePermissionIds(permissionIds: string | string[]): string[] {
    if (Array.isArray(permissionIds)) {
      return permissionIds;
    }

    try {
      const parsed = JSON.parse(permissionIds);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (error) {
      throw new BadRequestException('permissionIds باید یک آرایه JSON معتبر باشد');
    }
  }
}
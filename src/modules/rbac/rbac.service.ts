import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Role, RoleName } from '../../database/entities/role-permission/role.entity';
import { Permission } from '../../database/entities/role-permission/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
    private readonly cacheClearService: CacheClearService,
  ) { }



  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException('این کد دسترسی قبلاً ثبت شده است');

    const saved = await this.permissionRepo.save(this.permissionRepo.create(dto));
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*permissions*');
    return saved;
  }

  async updatePermission(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('دسترسی یافت نشد');

    Object.assign(permission, dto);
    const saved = await this.permissionRepo.save(permission);
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*permissions*');
    return saved;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('دسترسی یافت نشد');

    await this.permissionRepo.remove(permission);
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*permissions*');
  }

  async findAllRoles(q: AdminPaginationDto): Promise<PaginatedResponseDto<Role>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search } = q;
    const searchTerm = search?.trim();

    const qb = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .select([
        'role.id', 'role.name', 'role.displayName', 'role.description',
        'role.isActive', 'role.createdAt', 'role.updatedAt',
      ]);

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter(w => w.length >= 2);

      if (words.length > 0) {
        const conditions = words.map((word, index) => {
          return `(role.name ILIKE :word${index} OR role.displayName ILIKE :word${index} OR role.description ILIKE :word${index})`;
        });

        const params = words.reduce((acc, word, index) => {
          acc[`word${index}`] = `%${word}%`;
          return acc;
        }, {});

        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'name', 'displayName'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`role.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findAllPermissions(q: AdminPaginationDto): Promise<PaginatedResponseDto<Permission>> {
    const { page = 1, limit = 10, sortBy = 'resource', sortOrder = 'ASC', search } = q;
    const searchTerm = search?.trim();

    const qb = this.permissionRepo
      .createQueryBuilder('permission')
      .select([
        'permission.id', 'permission.resource', 'permission.action',
        'permission.code', 'permission.displayName', 'permission.description',
        'permission.createdAt', 'permission.updatedAt',
      ]);

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter(w => w.length >= 2);

      if (words.length > 0) {
        const conditions = words.map((word, index) => {
          return `(permission.code ILIKE :word${index} OR permission.displayName ILIKE :word${index} OR permission.description ILIKE :word${index})`;
        });

        const params = words.reduce((acc, word, index) => {
          acc[`word${index}`] = `%${word}%`;
          return acc;
        }, {});

        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'resource', 'action', 'code'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'resource';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`permission.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('نقش یافت نشد');
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

    if (dto.permissionIds) {
      const ids = this.parseIds(dto.permissionIds);
      role.permissions = await this.permissionRepo.findBy({ id: In(ids) });
    }

    const saved = await this.roleRepo.save(role);
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*roles*');
    return saved;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('نقش یافت نشد');

    if (role.name === RoleName.SUPER_ADMIN && dto.name && dto.name !== RoleName.SUPER_ADMIN) {
      throw new ConflictException('تغییر نام نقش Super Admin مجاز نیست');
    }

    Object.assign(role, dto);

    if (dto.permissionIds !== undefined) {
      const ids = this.parseIds(dto.permissionIds);
      role.permissions = await this.permissionRepo.findBy({ id: In(ids) });
    }

    const saved = await this.roleRepo.save(role);
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*roles*');
    return saved;
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('نقش یافت نشد');
    if (role.name === RoleName.SUPER_ADMIN) {
      throw new ConflictException('حذف نقش Super Admin مجاز نیست');
    }

    await this.roleRepo.remove(role);
    await this.cacheClearService.clearByPattern('cache:*rbac*');
    await this.cacheClearService.clearByPattern('cache:*roles*');
  }

  private parseIds(ids: string | string[]): string[] {
    if (Array.isArray(ids)) return ids;
    try {
      const parsed = JSON.parse(ids);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      throw new BadRequestException('فرمت IDs نامعتبر است');
    }
  }
}
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, IsNull } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role-permission/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminPaginationDto } from '../../common/dto/admin-pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { CacheClearService } from '../../common/services/cache-clear.service';

export type SafeUserResponse = Omit<User, 'password' | 'deletedAt'> & {
  roles: { id: string; name: string; displayName: string }[];
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly cacheClearService: CacheClearService,
  ) {}

  // ==================== Admin Methods ====================

  async findAll(q: AdminPaginationDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search } = q;
    const searchTerm = search?.trim();

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.deletedAt IS NULL')
      .select([
        'user.id',
        'user.phone',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.nationalCode',
        'user.avatarUrl',
        'user.isVerified',
        'user.isActive',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt',
        'roles.id',
        'roles.name',
        'roles.displayName',
      ]);

    if (searchTerm && searchTerm.length >= 2) {
      const words = searchTerm.split(/\s+/).filter((w) => w.length >= 2);

      if (words.length > 0) {
        const conditions = words.map((word, index) => {
          return `(user.firstName ILIKE :word${index} OR user.lastName ILIKE :word${index} OR user.phone ILIKE :word${index} OR user.email ILIKE :word${index} OR user.nationalCode ILIKE :word${index})`;
        });

        const params = words.reduce((acc, word, index) => {
          acc[`word${index}`] = `%${word}%`;
          return acc;
        }, {} as Record<string, string>);

        qb.andWhere(`(${conditions.join(' OR ')})`, params);
      }
    }

    const validSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'phone'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`user.${safeSortBy}`, safeSortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { roles: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUserResponse> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { roles: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    if (dto.phone && dto.phone !== user.phone) {
      const exists = await this.userRepo.findOne({
        where: { phone: dto.phone, deletedAt: IsNull() },
      });
      if (exists) throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email, deletedAt: IsNull() },
      });
      if (exists) throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    Object.assign(user, dto);

    if (dto.roleIds !== undefined) {
      if (dto.roleIds.length === 0) {
        throw new BadRequestException('کاربر باید حداقل یک نقش داشته باشد');
      }
      const roles = await this.roleRepo.findBy({ id: In(dto.roleIds) });
      if (roles.length !== dto.roleIds.length) {
        throw new BadRequestException('یک یا چند نقش نامعتبر هستند');
      }
      user.roles = roles;
    }

    const saved = await this.userRepo.save(user);
    await this.cacheClearService.clearByPattern('cache:*users*');

    const { password, deletedAt, ...result } = saved;
    return result as SafeUserResponse;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { roles: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    const isSuperAdmin = user.roles?.some((r) => r.name === 'super_admin');
    if (isSuperAdmin) {
      throw new BadRequestException('حذف کاربر با نقش سوپر ادمین مجاز نیست');
    }

    await this.userRepo.softDelete(id);
    await this.cacheClearService.clearByPattern('cache:*users*');
  }

  // ==================== User Profile Methods ====================

  async getProfile(userId: string): Promise<SafeUserResponse> {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: { roles: true },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    
    const { password, deletedAt, ...result } = user;
    return result as SafeUserResponse;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUserResponse> {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email, deletedAt: IsNull() },
      });
      if (exists) throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    await this.cacheClearService.clearByPattern('cache:*users*');

    const { password, deletedAt, ...result } = saved;
    return result as SafeUserResponse;
  }
}
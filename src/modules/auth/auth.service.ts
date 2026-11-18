import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';

import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache, 
  ) {}

  async validateUser(phone: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: { roles: { permissions: true } },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال است');
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as any,
      }),
    ]);

    const refreshTokenKey = `refresh_token:${user.id}`;
    await this.cacheManager.set(
      refreshTokenKey,
      refreshToken,
      7 * 24 * 60 * 60 * 1000, 
    );

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(phone: string, password: string) {
    const user = await this.validateUser(phone, password);
    return this.generateTokens(user);
  }

  async register(dto: RegisterDto) {
    const existingByPhone = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existingByPhone) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    let userRole = await this.roleRepository.findOne({ where: { name: RoleName.USER } });
    
    if (!userRole) {
      userRole = this.roleRepository.create({
        name: RoleName.USER,
        displayName: 'کاربر عادی',
        description: 'دسترسی محدود به پنل کاربری',
      });
      await this.roleRepository.save(userRole);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      phone: dto.phone,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      nationalCode: dto.nationalCode,
      avatarUrl: dto.avatarUrl,
      roles: [userRole],
    });

    const savedUser = await this.userRepository.save(newUser);

    const userWithRoles = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: { roles: { permissions: true } },
    });

    return this.generateTokens(userWithRoles!);
  }


  async refreshTokens(user: User, refreshToken: string) {
    const refreshTokenKey = `refresh_token:${user.id}`;
    const storedRefreshToken = await this.cacheManager.get<string>(refreshTokenKey);

    if (!storedRefreshToken) {
      throw new UnauthorizedException('لطفاً دوباره وارد شوید');
    }

    if (storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token نامعتبر است. لطفاً دوباره وارد شوید');
    }

    return this.generateTokens(user);
  }


  async logout(userId: string): Promise<void> {
    const refreshTokenKey = `refresh_token:${userId}`;
    await this.cacheManager.del(refreshTokenKey);
  }

  private sanitizeUser(user: User) {
    const { password, deletedAt, ...sanitized } = user;
    return sanitized;
  }
}
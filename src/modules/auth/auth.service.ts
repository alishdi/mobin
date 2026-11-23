import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; 
import * as bcrypt from 'bcrypt';

import { User } from '../../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenStorageService } from './token-storage.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
    private readonly tokenStorage: TokenStorageService,
  ) {}

  // ==================== LOGIN ====================

  async login(dto: LoginDto) {
    this.logger.log(`🔐 تلاش برای لاگین با شماره: ${dto.phone}`);

    const user = await this.userRepo.findOne({
      where: { phone: dto.phone },
      relations: { roles: true },
    });

    if (!user) {
      this.logger.warn(`❌ کاربر با شماره ${dto.phone} یافت نشد`);
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    this.logger.debug(`✅ کاربر یافت شد: ${user.firstName} ${user.lastName}`);
    this.logger.debug(`   isActive: ${user.isActive}`);
    this.logger.debug(`   password length: ${user.password?.length || 0}`);

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال است');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    this.logger.debug(`   password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const payload = { sub: user.id, phone: user.phone };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '60m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });

    await this.tokenStorage.saveRefreshToken(user.id, refreshToken);

    this.logger.log(`✅ لاگین موفق برای کاربر ${user.phone}`);

    return {
      statusCode: 200,
      message: 'ورود با موفقیت انجام شد',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // ==================== REGISTER ====================

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });

    if (exists) {
      throw new BadRequestException('این شماره موبایل قبلاً ثبت شده است');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      phone: dto.phone,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      isVerified: false,
      isActive: true,
    });

    const savedUser = await this.userRepo.save(user);

    return {
      statusCode: 201,
      message: 'ثبت‌نام با موفقیت انجام شد',
      data: {
        id: savedUser.id,
        phone: savedUser.phone,
      },
    };
  }

  // ==================== REFRESH TOKEN ====================

  async refreshTokens(refreshToken: string) {
    this.logger.log('🔄 تلاش برای تجدید توکن');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token ارسال نشده است');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error:any) {
      this.logger.warn(`❌ Refresh Token نامعتبر یا منقضی شده: ${error.message}`);
      throw new UnauthorizedException('Refresh Token نامعتبر است یا منقضی شده است');
    }

    const isValid = await this.tokenStorage.validateRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!isValid) {
      this.logger.warn(`❌ Refresh Token در Redis یافت نشد (خروج شده)`);
      throw new UnauthorizedException('Refresh Token منقضی شده است');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    const newPayload = { sub: user.id, phone: user.phone };

    const accessToken = this.jwtService.sign(newPayload, {
      expiresIn: '60m',
    });

    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });

    await this.tokenStorage.saveRefreshToken(user.id, newRefreshToken);

    this.logger.log(`✅ توکن‌ها با موفقیت تجدید شدند`);

    return {
      statusCode: 200,
      message: 'توکن‌ها با موفقیت تجدید شدند',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  // ==================== LOGOUT ====================

  async logout(userId: string) {
    await this.tokenStorage.removeRefreshToken(userId);
    return {
      statusCode: 200,
      message: 'خروج با موفقیت انجام شد',
    };
  }

  // ==================== GET ME ====================

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const { password, deletedAt, ...result } = user;
    return result;
  }
}
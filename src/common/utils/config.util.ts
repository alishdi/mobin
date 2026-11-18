import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigHelper {
  constructor(private readonly configService: ConfigService) {}

  // App
  get port(): number {
    return this.configService.getOrThrow<number>('app.port');
  }

  get apiPrefix(): string {
    return this.configService.getOrThrow<string>('app.apiPrefix');
  }

  get isDevelopment(): boolean {
    return this.configService.getOrThrow<boolean>('app.isDevelopment');
  }

  get isProduction(): boolean {
    return this.configService.getOrThrow<boolean>('app.isProduction');
  }

  // Cache (Dragonfly)
  get cacheHost(): string {
    return this.configService.getOrThrow<string>('cache.host');
  }

  get cachePort(): number {
    return this.configService.getOrThrow<number>('cache.port');
  }

  get cachePassword(): string | undefined {
    return this.configService.get<string>('cache.password'); 
  }

  // JWT
  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('jwt.secret');
  }

  get jwtExpiresIn(): string {
    return this.configService.getOrThrow<string>('jwt.expiresIn');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('jwt.refreshSecret');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.getOrThrow<string>('jwt.refreshExpiresIn');
  }

  // Encryption
  get encryptionKey(): string {
    return this.configService.getOrThrow<string>('encryption.key');
  }

    // ==================== Super Admin ====================
  get superAdminPhone(): string {
    return this.configService.getOrThrow<string>('SUPER_ADMIN_PHONE');
  }

  get superAdminPassword(): string {
    return this.configService.getOrThrow<string>('SUPER_ADMIN_PASSWORD');
  }

  get superAdminFirstName(): string {
    return this.configService.getOrThrow<string>('SUPER_ADMIN_FIRST_NAME');
  }

  get superAdminLastName(): string {
    return this.configService.getOrThrow<string>('SUPER_ADMIN_LAST_NAME');
  }

  get superAdminEmail(): string | undefined {
    return this.configService.get<string>('SUPER_ADMIN_EMAIL') || undefined;
  }

  get superAdminResetPassword(): boolean {
    return this.configService.get<boolean>('SUPER_ADMIN_RESET_PASSWORD') ?? false;
  }
}
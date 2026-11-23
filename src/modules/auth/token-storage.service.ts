import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class TokenStorageService {
  private readonly logger = new Logger(TokenStorageService.name);
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 روز

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    const hashedToken = this.hashToken(refreshToken);
    await this.cacheManager.set(key, hashedToken, this.REFRESH_TOKEN_TTL);
    this.logger.debug(`Refresh Token saved for user ${userId}`);
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    const storedHashedToken = await this.cacheManager.get<string>(key);
    if (!storedHashedToken) return false;

    const hashedToken = this.hashToken(refreshToken);
    return storedHashedToken === hashedToken;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    await this.cacheManager.del(key);
    this.logger.debug(`Refresh Token removed for user ${userId}`);
  }

  async hasRefreshToken(userId: string): Promise<boolean> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    const token = await this.cacheManager.get<string>(key);
    return !!token;
  }
}
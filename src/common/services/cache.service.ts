import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async clearByPattern(pattern: string): Promise<void> {
    const store = (this.cacheManager as any).store;
    
    if (store && typeof store.keys === 'function') {
      try {
        const keys = await store.keys();
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
        );
        const matchedKeys = keys.filter((key: string) => regex.test(key));

        for (const key of matchedKeys) {
          await this.cacheManager.del(key);
          this.logger.debug(`🗑️ کش پاک شد: ${key}`);
        }
      } catch (error:any) {
        this.logger.warn(`خطا در پاک کردن کش با الگو ${pattern}: ${error.message}`);
      }
    }
  }


  async clear(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`🗑️ کش پاک شد: ${key}`);
  }


  async clearAll(): Promise<void> {
    await this.cacheManager.clear();
    this.logger.debug('🗑️ کل کش پاک شد');
  }
}
import { Injectable, Inject, Logger, Global } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

                                                                                                                                                                                                                                                                                    
@Global()
@Injectable()
export class CacheClearService {
  private readonly logger = new Logger(CacheClearService.name);

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
        this.logger.warn(`خطا در پاک کردن کش: ${error.message}`);
      }
    }
  }
}
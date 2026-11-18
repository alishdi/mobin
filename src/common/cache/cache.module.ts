import { Module, Logger, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis-yet';

const cacheLogger = new Logger('CacheModule');

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('REDIS_HOST');
        const port = configService.getOrThrow<number>('REDIS_PORT');
        
        cacheLogger.log(`🔌 در حال اتصال به Dragonfly/Redis در آدرس: ${host}:${port}`);

        return {
          store: redisStore,
          host: host,
          port: port,
          password: configService.getOrThrow<string>('REDIS_PASSWORD') || undefined,
          ttl: configService.getOrThrow<number>('REDIS_TTL') || 300,
        };
      },
    }),
  ],
  exports: [NestCacheModule], 
})
export class CacheModule {}
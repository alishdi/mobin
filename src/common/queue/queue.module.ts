import { Module, Logger, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

const queueLogger = new Logger('QueueModule');

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');
        
        queueLogger.log(`🔌 در حال پیکربندی BullMQ (Dragonfly) در آدرس: ${host}:${port}`);

        return {
          redis: {
            host: host,
            port: port,
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
        };
      },
    }),
  ],
  exports: [BullModule], 
})
export class QueueModule {}
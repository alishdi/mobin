import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; // ← ایمپورت APP_GUARD از core
import { ConfigModule } from '@nestjs/config';

import { validationSchema } from './config/env.validation';
import { DatabaseModule } from './config/db.config'; 
import { CacheModule } from './common/cache/cache.module';
import { QueueModule } from './common/queue/queue.module';

import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/setting/setting.module'; 

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { RbacModule } from './modules/rbac/rbac.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: validationSchema,
    }),
    DatabaseModule,
    CacheModule,
    QueueModule,
    AuthModule,
    SettingsModule,
    RbacModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, 
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, 
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, 
    },
  ],
})
export class AppModule {}
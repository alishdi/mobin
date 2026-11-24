import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { CatalogModule } from './modules/catalog/product.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/user.module';
import { CacheClearService } from './common/services/cache-clear.service';
import { CommonModule } from './common/commo.module';

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
    CommonModule,
    AuthModule,
    SettingsModule,
    RbacModule,
    CatalogModule,
    VehiclesModule,
    UploadsModule,
    UsersModule
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
export class AppModule { }
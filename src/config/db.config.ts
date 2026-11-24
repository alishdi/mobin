import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../database/entities/user.entity';
import { Vehicle } from '../database/entities/vehicles/vehicle.entity';
import { Contract } from '../database/entities/contract.entity';
import { Payment } from '../database/entities/payment.entity';

import { Role } from '../database/entities/role-permission/role.entity';
import { Permission } from '../database/entities/role-permission/permission.entity';

import { Setting } from '../database/entities/setting.entity';
import { Menu } from '../database/entities/menu/menu.entity';
import { Slider } from '../database/entities/slider.entity';
import { Footer } from '../database/entities/footer/footer.entity';
import { Submenu } from '../database/entities/menu/sub-menu.entity';
import { Megamenu } from '../database/entities/menu/mega-menu.entity';
import { Product } from '../database/entities/product/product.entity';
import { Brand } from '../database/entities/product/brand.entity';
import { VehicleModel } from '../database/entities/vehicles/vehicle-model.entity';
import { InstallmentPlan } from '../database/entities/installment/installment-plan.entity';
import { ApiClient } from '../database/entities/api-client/api-client.entity';

const dbLogger = new Logger('DatabaseModule');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        dbLogger.log(`🔌 در حال اتصال به PostgreSQL (محیط: ${isProd ? 'Production' : 'Development'})...`);

        return {
          type: 'postgres',
          url: configService.getOrThrow<string>('DATABASE_URL'),

          entities: [
            User, Vehicle, Contract, Payment,
            Role, Permission,
            Setting, Menu, Submenu, Megamenu, Slider, Footer,
            Product, Brand, VehicleModel, InstallmentPlan, ApiClient
          ],
          synchronize: !isProd,
          extra: {
            max: isProd ? 20 : 5,

            min: isProd ? 2 : 0,

            idleTimeoutMillis: 30000,

            connectionTimeoutMillis: 5000,

            statement_timeout: 10000,

            ...(isProd && {
              ssl: { rejectUnauthorized: false },
            }),
          },

          poolSize: isProd ? 20 : 5,
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),

    TypeOrmModule.forFeature([
      User, Vehicle, Contract, Payment,
      Role, Permission,
      Setting, Menu, Submenu, Megamenu, Slider, Footer,
      Product, Brand, VehicleModel, InstallmentPlan, ApiClient
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
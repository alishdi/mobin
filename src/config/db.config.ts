import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../database/entities/user.entity';
import { Vehicle } from '../database/entities/vehicle.entity';
import { Contract } from '../database/entities/contract.entity';
import { Payment } from '../database/entities/payment.entity';

import { Role } from '../database/entities/role.entity'; 
import { Permission } from '../database/entities/permission.entity';

import { Setting } from '../database/entities/setting.entity';
import { Menu } from '../database/entities/menu.entity';
import { Slider } from '../database/entities/slider.entity';
import { Footer } from '../database/entities/footer.entity';
import { Submenu } from '../database/entities/sub-menu.entity'; 
import { Megamenu } from '../database/entities/mega-menu.entity'; 

const dbLogger = new Logger('DatabaseModule');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        dbLogger.log('🔌 در حال اتصال به PostgreSQL...');

        return {
          type: 'postgres',
          url: configService.getOrThrow<string>('DATABASE_URL'),
 entities: [
  User, Vehicle, Contract, Payment,
  Role, Permission,
  Setting, Menu, Submenu, Megamenu, Slider, Footer,
],
          synchronize: configService.getOrThrow<string>('NODE_ENV') === 'development',
          ssl: configService.getOrThrow<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),
TypeOrmModule.forFeature([
  User, Vehicle, Contract, Payment,
  Role, Permission,
  Setting, Menu, Submenu, Megamenu, Slider, Footer,
]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
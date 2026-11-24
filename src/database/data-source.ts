import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { User } from './entities/user.entity';
import { Vehicle } from './entities/vehicles/vehicle.entity';
import { Contract } from './entities/contract.entity';
import { Payment } from './entities/payment.entity';
import { Role } from './entities/role-permission/role.entity';
import { Permission } from './entities/role-permission/permission.entity';
import { Setting } from './entities/setting.entity';
import { Menu } from './entities/menu/menu.entity';
import { Submenu } from './entities/menu/sub-menu.entity';
import { Megamenu } from './entities/menu/mega-menu.entity';
import { Slider } from './entities/slider.entity';
import { Footer } from './entities/footer/footer.entity';
import { Product } from './entities/product/product.entity';
import { Brand } from './entities/product/brand.entity';
import { VehicleModel } from './entities/vehicles/vehicle-model.entity';
import { InstallmentPlan } from './entities/installment/installment-plan.entity';
import { ApiClient } from './entities/api-client/api-client.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Vehicle,
    Contract,
    Payment,
    Role,
    Permission,
    Setting,
    Menu,
    Submenu,
    Megamenu,
    Slider,
    Footer,
    Product,
    Brand,
    VehicleModel,
    InstallmentPlan,
    ApiClient
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// بارگذاری متغیرهای محیطی
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// ✅ ایمپورت تمام Entityها (شامل Submenu و Megamenu)
import { User } from './entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Contract } from './entities/contract.entity';
import { Payment } from './entities/payment.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Setting } from './entities/setting.entity';
import { Menu } from './entities/menu.entity';
import { Submenu } from './entities/sub-menu.entity';    
import { Megamenu } from './entities/mega-menu.entity'; 
import { Slider } from './entities/slider.entity';
import { Footer } from './entities/footer.entity';

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
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, 
  logging: true,
});
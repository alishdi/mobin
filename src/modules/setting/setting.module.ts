import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsController } from './setting.controller'; 
import { SettingsService } from './settings.service';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { SubmenuController } from './submenu.controller';
import { SubmenuService } from './submenu.service';
import { MegamenuController } from './mega.menu.controller'; 
import { MegamenuService } from './megamenu.service';

import { Setting } from '../../database/entities/setting.entity';
import { Menu } from 'src/database/entities/menu.entity'; 
import { Submenu } from 'src/database/entities/sub-menu.entity'; 
import { Megamenu } from 'src/database/entities/mega-menu.entity'; 
import { Slider } from '../../database/entities/slider.entity';
import { Footer } from '../../database/entities/footer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, Menu, Submenu, Megamenu, Slider, Footer]),
  ],
  controllers: [
    SettingsController,
    MenuController,
    SubmenuController,
    MegamenuController,
  ],
  providers: [
    SettingsService,
    MenuService,
    SubmenuService,
    MegamenuService,
  ],
  exports: [SettingsService, MenuService, SubmenuService, MegamenuService],
})
export class SettingsModule {}
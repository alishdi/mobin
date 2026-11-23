import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminUserController, UserProfileController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role-permission/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [
    AdminUserController,
    UserProfileController,
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
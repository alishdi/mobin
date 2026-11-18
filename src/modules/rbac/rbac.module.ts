import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
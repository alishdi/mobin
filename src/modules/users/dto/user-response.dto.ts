import { OmitType, PickType } from '@nestjs/swagger';
import { User } from '../../../database/entities/user.entity';
import { Role } from '../../../database/entities/role-permission/role.entity';

export class RoleSummaryDto extends PickType(Role, [
  'id',
  'name',
  'displayName',
] as const) {}


export class SafeUserResponseDto extends OmitType(User, [
  'password',
  'deletedAt',
] as const) {}
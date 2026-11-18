import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmenuDto } from './create-sub-menu.dto'; 

export class UpdateSubmenuDto extends PartialType(CreateSubmenuDto) {}
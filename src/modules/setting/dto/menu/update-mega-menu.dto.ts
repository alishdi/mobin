import { PartialType } from '@nestjs/mapped-types';
import { CreateMegamenuDto } from './create-mega-menu.dto'; 

export class UpdateMegamenuDto extends PartialType(CreateMegamenuDto) {}
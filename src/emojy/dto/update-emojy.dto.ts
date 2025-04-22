import { PartialType } from '@nestjs/mapped-types';
import { CreateEmojyDto } from './create-emojy.dto';

export class UpdateEmojyDto extends PartialType(CreateEmojyDto) {}

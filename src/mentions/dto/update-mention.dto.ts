import { PartialType } from '@nestjs/mapped-types';
import { CreateMentionsDto } from './create-mention.dto';

export class UpdateMentionDto extends PartialType(CreateMentionsDto) {}

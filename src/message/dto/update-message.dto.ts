import { PartialType } from '@nestjs/mapped-types';
import {
  CreateChannelMessageDto,
  CreateDMMessageDTO,
} from './create-message.dto';

export class UpdateChannelMessageDto extends PartialType(
  CreateChannelMessageDto,
) {}
export class UpdateDMMessageDto extends PartialType(CreateDMMessageDTO) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateChannelMessageDto) {}

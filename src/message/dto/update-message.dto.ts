import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMessageDTO } from './create-channel-message.dto';

export class UpdateMessageDto extends PartialType(CreateChannelMessageDTO) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelsDto } from './create-channel.dto';

export class UpdateChannelsDto extends PartialType(CreateChannelsDto) {}

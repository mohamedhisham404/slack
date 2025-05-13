// validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './create-message.dto';

@ValidatorConstraint({ name: 'IsChannelOrWorkspaceWithUser', async: false })
@Injectable()
export class IsChannelOrWorkspaceWithUserConstraint
  implements ValidatorConstraintInterface
{
  validate(object: CreateMessageDto): boolean {
    if (object.channelId) return true;
    return !!object.workspaceId && !!object.userId;
  }

  defaultMessage(): string {
    return 'Either provide channelId OR both workspaceId and userId';
  }
}

import {
  ValidationArguments,
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
  validate(_value: any, args: ValidationArguments): boolean {
    const object = args.object as CreateMessageDto;
    if (object.channelId) return true;
    else if (object.workspaceId && object.userId) return true;
    return false;
  }

  defaultMessage(): string {
    return 'Either provide channelId OR both workspaceId and userId';
  }
}

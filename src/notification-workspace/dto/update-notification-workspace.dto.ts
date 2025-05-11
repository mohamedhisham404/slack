import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationWorkspaceDto } from './create-notification-workspace.dto';

export class UpdateNotificationWorkspaceDto extends PartialType(
  CreateNotificationWorkspaceDto,
) {}

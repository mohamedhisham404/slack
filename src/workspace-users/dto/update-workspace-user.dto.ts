import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceUsersDto } from './create-workspace-user.dto';

export class UpdateWorkspaceUsersDto extends PartialType(
  CreateWorkspaceUsersDto,
) {}

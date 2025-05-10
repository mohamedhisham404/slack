import { IsEnum, IsUUID } from 'class-validator';
import { workspaceRole } from '../enums/workspace-role.enum';

export class AddUserDto {
  @IsUUID() workspaceId: string;
  @IsUUID() userId: string;
  @IsEnum(workspaceRole) role?: workspaceRole;
}

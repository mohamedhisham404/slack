import { IsEnum, IsString, IsUUID } from 'class-validator';
import { workspaceRole } from '../enums/workspace-role.enum';

export class AddUserDTO {
  @IsString() @IsUUID() workspaceId: string;
  @IsString() @IsUUID() userId: string;
  @IsEnum(workspaceRole) role?: workspaceRole;
}

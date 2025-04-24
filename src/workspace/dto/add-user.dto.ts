import { IsEnum, IsNumber } from 'class-validator';
import { workspaceRole } from '../entities/user-workspace.entity';

export class AddUserDto {
  @IsNumber() workspace_id: number;
  @IsNumber() user_id: number;
  @IsEnum(workspaceRole) role?: string;
}

import { IsEnum, IsNumber } from 'class-validator';

export class CreateWorkspaceUsersDto {
  @IsNumber() user_id: number;
  @IsNumber() workspace_id: number;

  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
}

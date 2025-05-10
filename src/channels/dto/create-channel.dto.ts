import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChannelsDto {
  @IsUUID() workspaceId: string;
  @IsUUID() name: string;

  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() is_private?: boolean;
  @IsOptional() @IsBoolean() is_dm?: boolean;
  @IsOptional() @IsBoolean() admin_only?: boolean;
}

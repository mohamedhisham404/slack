import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChannelsDto {
  @IsNumber() workspace_id: number;
  @IsString() name: string;

  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() is_private?: boolean;
  @IsOptional() @IsBoolean() is_dm?: boolean;
}

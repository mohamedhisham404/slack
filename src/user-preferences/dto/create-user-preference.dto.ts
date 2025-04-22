import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserPreferencesDto {
  @IsOptional()
  @IsString()
  time_zone?: string;

  @IsEnum(['light', 'dark'])
  color_mode: 'light' | 'dark';

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

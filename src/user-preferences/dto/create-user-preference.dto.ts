import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserColorMode } from '../enums/userColorMode.enum';
import { UserTheme } from '../enums/userTheme.enum';
import { UserLanguage } from '../enums/userLanguage.enum';

export class CreateUserPreferencesDto {
  @IsOptional()
  @IsString()
  time_zone?: string;

  @IsEnum(UserColorMode)
  color_mode: UserColorMode;

  @IsOptional()
  @IsEnum(UserTheme)
  theme?: UserTheme;

  @IsOptional()
  @IsEnum(UserLanguage)
  language?: UserLanguage;
}

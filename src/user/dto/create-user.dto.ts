import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MinLength,
  Matches,
} from 'class-validator';

// Password validation regex
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsOptional() @IsString() phone: string;
  @IsOptional() @IsString() profile_photo?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsString() about_me?: string;
  @IsOptional() @IsDateString() last_login?: string;
}

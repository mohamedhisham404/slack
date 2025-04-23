import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;

  @IsOptional() @IsString() phone: string;
  @IsOptional() @IsString() profile_photo?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsString() about_me?: string;
  @IsOptional() @IsDateString() last_login?: string;
}

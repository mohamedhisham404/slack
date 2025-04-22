import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() phone: string;
  @IsString() password: string;

  @IsOptional() @IsString() profile_photo?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsString() about_me?: string;
  @IsOptional() @IsDateString() last_login?: string;
}

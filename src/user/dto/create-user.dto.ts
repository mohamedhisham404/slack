import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

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

  @Matches(/^01\d{9}$/, {
    message: 'Phone number must start with 01 and be 11 digits long',
  })
  @IsOptional()
  @IsString()
  phone: string;
}

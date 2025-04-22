import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPreferencesDto } from './create-user-preference.dto';

export class UpdateUserPreferenceDto extends PartialType(
  CreateUserPreferencesDto,
) {}

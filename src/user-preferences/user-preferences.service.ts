import { Injectable } from '@nestjs/common';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { getUserFromRequest } from 'src/utils/get-user';
import { UserColorMode } from './enums/userColorMode.enum';
import { UserTheme } from './enums/userTheme.enum';
import { UserLanguage } from './enums/userLanguage.enum';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepo: Repository<UserPreferences>,
  ) {}

  async findOne(req: Request) {
    try {
      const reqUser = getUserFromRequest(req);
      const currentUserId = reqUser?.userId;

      const userPreferences = await this.userPreferencesRepo.findOne({
        where: { user: { id: currentUserId } },
      });

      return userPreferences;
    } catch (error) {
      handleError(error);
    }
  }

  async update(req: Request, updateUserPreferenceDto: UpdateUserPreferenceDto) {
    try {
      const reqUser = getUserFromRequest(req);
      const currentUserId = reqUser?.userId;

      const result = await this.userPreferencesRepo
        .createQueryBuilder()
        .update(UserPreferences)
        .set({
          time_zone: updateUserPreferenceDto.time_zone,
          color_mode: updateUserPreferenceDto.color_mode as UserColorMode,
          theme: updateUserPreferenceDto.theme as UserTheme,
          language: updateUserPreferenceDto.language as UserLanguage,
        })
        .where('user_id = :userId', { userId: currentUserId })
        .returning('*')
        .execute();

      const updatedPrefrances = (result.raw as UserPreferences[])[0];
      return updatedPrefrances;
    } catch (error) {
      handleError(error);
    }
  }
}

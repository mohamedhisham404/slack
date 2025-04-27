import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepo: Repository<UserPreferences>,
  ) {}

  async findOne(req: Request) {
    try {
      const userId = req.user.userId;

      const userPreferences = await this.userPreferencesRepo.findOne({
        where: { user_id: userId },
      });

      return userPreferences;
    } catch (error) {
      handleError(error);
    }
  }

  async update(req: Request, updateUserPreferenceDto: UpdateUserPreferenceDto) {
    try {
      const userId = req.user.userId;

      const preferences = await this.userPreferencesRepo.findOne({
        where: { user_id: userId },
      });

      if (!preferences) {
        throw new NotFoundException('Preferences not found');
      }

      Object.assign(preferences, updateUserPreferenceDto);
      return this.userPreferencesRepo.save(preferences);
    } catch (error) {
      handleError(error);
    }
  }
}

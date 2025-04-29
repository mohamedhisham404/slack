import { Module } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferences, User])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
})
export class UserPreferencesModule {}

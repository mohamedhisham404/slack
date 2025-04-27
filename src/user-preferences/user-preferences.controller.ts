import { Controller, Get, Body, Patch, Req } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { Request } from 'express';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Get()
  async findOne(@Req() req: Request) {
    return this.userPreferencesService.findOne(req);
  }

  @Patch()
  update(
    @Req() req: Request,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferencesService.update(req, updateUserPreferenceDto);
  }
}

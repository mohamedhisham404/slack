import { Controller, Get, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';

@UseGuards(AuthGuard)
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

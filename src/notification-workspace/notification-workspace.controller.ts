import { Controller, Get, Body, Patch, Req } from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';
import { Request } from 'express';

@Controller('notification-workspace')
export class NotificationWorkspaceController {
  constructor(
    private readonly notificationWorkspaceService: NotificationWorkspaceService,
  ) {}

  @Get()
  async findOne(@Req() req: Request) {
    return this.notificationWorkspaceService.findOne(req);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Body() updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto,
  ) {
    return this.notificationWorkspaceService.update(
      req,
      updateNotificationWorkspaceDto,
    );
  }
}

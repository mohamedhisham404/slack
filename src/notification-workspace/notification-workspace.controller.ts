import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';

@UseGuards(AuthGuard)
@Controller('notification-workspace')
export class NotificationWorkspaceController {
  constructor(
    private readonly notificationWorkspaceService: NotificationWorkspaceService,
  ) {}

  @Get(':workspaceId')
  async findOne(
    @Req() req: Request,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.notificationWorkspaceService.findOne(req, workspaceId);
  }

  @Patch(':workspaceId')
  async update(
    @Req() req: Request,
    @Body() updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
  ) {
    return this.notificationWorkspaceService.update(
      req,
      updateNotificationWorkspaceDto,
      workspaceId,
    );
  }
}

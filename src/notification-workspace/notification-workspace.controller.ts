import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationWorkspaceService } from './notification-workspace.service';
import { CreateNotificationWorkspaceDto } from './dto/create-notification-workspace.dto';
import { UpdateNotificationWorkspaceDto } from './dto/update-notification-workspace.dto';

@Controller('notification-workspace')
export class NotificationWorkspaceController {
  constructor(private readonly notificationWorkspaceService: NotificationWorkspaceService) {}

  @Post()
  create(@Body() createNotificationWorkspaceDto: CreateNotificationWorkspaceDto) {
    return this.notificationWorkspaceService.create(createNotificationWorkspaceDto);
  }

  @Get()
  findAll() {
    return this.notificationWorkspaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationWorkspaceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationWorkspaceDto: UpdateNotificationWorkspaceDto) {
    return this.notificationWorkspaceService.update(+id, updateNotificationWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationWorkspaceService.remove(+id);
  }
}

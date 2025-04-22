import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationChannelService } from './notification-channel.service';
import { CreateNotificationChannelDto } from './dto/create-notification-channel.dto';
import { UpdateNotificationChannelDto } from './dto/update-notification-channel.dto';

@Controller('notification-channel')
export class NotificationChannelController {
  constructor(private readonly notificationChannelService: NotificationChannelService) {}

  @Post()
  create(@Body() createNotificationChannelDto: CreateNotificationChannelDto) {
    return this.notificationChannelService.create(createNotificationChannelDto);
  }

  @Get()
  findAll() {
    return this.notificationChannelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationChannelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationChannelDto: UpdateNotificationChannelDto) {
    return this.notificationChannelService.update(+id, updateNotificationChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationChannelService.remove(+id);
  }
}

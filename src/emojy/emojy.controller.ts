import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { CreateEmojyDto } from './dto/create-emojy.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guards';
import { CreateMessageReactionDto } from './dto/create-message-emojy.dto';

@UseGuards(AuthGuard)
@Controller('emojy')
export class EmojyController {
  constructor(private readonly emojyService: EmojyService) {}

  @Post(':channelId')
  async create(
    @Body() createEmojyDto: CreateEmojyDto,
    @Param('channelId') channelId: string,
    @Req() req: Request,
  ) {
    return this.emojyService.create(createEmojyDto, +channelId, req);
  }

  @Get(':channelId')
  async findAll(@Param('channelId') channelId: string, @Req() req: Request) {
    return this.emojyService.findAll(+channelId, req);
  }

  @Get(':emojyId/channel/:channelId')
  async findOne(
    @Param('channelId') channelId: string,
    @Param('emojyId') emojyId: string,
    @Req() req: Request,
  ) {
    return this.emojyService.findOne(+emojyId, +channelId, req);
  }

  @Post('message')
  async setEmojyToMessage(
    @Req() req: Request,
    @Body() CreateMessageReactionDto: CreateMessageReactionDto,
  ) {
    return this.emojyService.setEmojyToMessage(CreateMessageReactionDto, req);
  }
}

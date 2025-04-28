import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
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

  @Post(':workspaceId')
  async create(
    @Body() createEmojyDto: CreateEmojyDto,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: Request,
  ) {
    return this.emojyService.create(createEmojyDto, workspaceId, req);
  }

  @Get(':workspaceId')
  async findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: Request,
  ) {
    return this.emojyService.findAll(workspaceId, req);
  }

  @Get(':emojyId/workspace/:workspaceId')
  async findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('emojyId', ParseIntPipe) emojyId: number,
    @Req() req: Request,
  ) {
    return this.emojyService.findOne(emojyId, workspaceId, req);
  }

  @Post('message')
  async setEmojyToMessage(
    @Req() req: Request,
    @Body() CreateMessageReactionDto: CreateMessageReactionDto,
  ) {
    return this.emojyService.setEmojyToMessage(CreateMessageReactionDto, req);
  }
}

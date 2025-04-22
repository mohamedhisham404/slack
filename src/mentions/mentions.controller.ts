import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { CreateMentionsDto } from './dto/create-mention.dto';
import { UpdateMentionDto } from './dto/update-mention.dto';

@Controller('mentions')
export class MentionsController {
  constructor(private readonly mentionsService: MentionsService) {}

  @Post()
  create(@Body() createMentionDto: CreateMentionsDto) {
    return this.mentionsService.create(createMentionDto);
  }

  @Get()
  findAll() {
    return this.mentionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mentionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMentionDto: UpdateMentionDto) {
    return this.mentionsService.update(+id, updateMentionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mentionsService.remove(+id);
  }
}

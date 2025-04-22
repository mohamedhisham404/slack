import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmojyService } from './emojy.service';
import { CreateEmojyDto } from './dto/create-emojy.dto';
import { UpdateEmojyDto } from './dto/update-emojy.dto';

@Controller('emojy')
export class EmojyController {
  constructor(private readonly emojyService: EmojyService) {}

  @Post()
  create(@Body() createEmojyDto: CreateEmojyDto) {
    return this.emojyService.create(createEmojyDto);
  }

  @Get()
  findAll() {
    return this.emojyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emojyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmojyDto: UpdateEmojyDto) {
    return this.emojyService.update(+id, updateEmojyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emojyService.remove(+id);
  }
}

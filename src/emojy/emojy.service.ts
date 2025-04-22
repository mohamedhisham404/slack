import { Injectable } from '@nestjs/common';
import { CreateEmojyDto } from './dto/create-emojy.dto';
import { UpdateEmojyDto } from './dto/update-emojy.dto';

@Injectable()
export class EmojyService {
  create(createEmojyDto: CreateEmojyDto) {
    return 'This action adds a new emojy';
  }

  findAll() {
    return `This action returns all emojy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emojy`;
  }

  update(id: number, updateEmojyDto: UpdateEmojyDto) {
    return `This action updates a #${id} emojy`;
  }

  remove(id: number) {
    return `This action removes a #${id} emojy`;
  }
}

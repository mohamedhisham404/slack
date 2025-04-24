import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entities/channel.entity';
import { ChannelRole, UserChannel } from './entities/user-channel.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workSpaceRepo: Repository<Workspace>,

    @InjectRepository(Channels)
    private readonly channelRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,
  ) {}

  async create(createChannelDto: CreateChannelsDto, req: Request) {
    try {
      const userId = req.user.userId;
      const { workspace_id, name, topic, description, is_private, is_dm } =
        createChannelDto;

      const existingWorkspace = await this.workSpaceRepo.findOne({
        where: { id: workspace_id },
      });

      if (!existingWorkspace) {
        throw new BadRequestException('Workspace does not exist');
      }

      const channel = this.channelRepo.create({
        workspace: existingWorkspace,
        name,
        created_by: userId,
        topic,
        description,
        is_private,
        is_dm,
      });

      const savedChannel = await this.channelRepo.save(channel);

      const userChannel = this.userChannelRepo.create({
        channel: channel,
        user: { id: userId },
        role: ChannelRole.ADMIN,
      });
      await this.userChannelRepo.save(userChannel);

      return savedChannel;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to create channel');
    }
  }

  findAll() {
    return `This action returns all channels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelsDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}

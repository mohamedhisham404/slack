import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChannelsDto } from './dto/create-channel.dto';
import { UpdateChannelsDto } from './dto/update-channel.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entities/channel.entity';
import { ChannelRole, UserChannel } from './entities/user-channel.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { AddUserDto } from './dto/add-user.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workSpaceRepo: Repository<Workspace>,

    @InjectRepository(Channels)
    private readonly channelRepo: Repository<Channels>,

    @InjectRepository(UserChannel)
    private readonly userChannelRepo: Repository<UserChannel>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

      throw new BadRequestException('Failed to add user');
    }
  }

  async addUser(addUser: AddUserDto, req: Request) {
    try {
      const { channel_id, user_id, role } = addUser;
      const currentUserId = req.user.userId;

      const channel = await this.channelRepo.findOne({
        where: { id: channel_id },
      });
      if (!channel) {
        throw new BadRequestException('Channel does not exist');
      }

      const addedUser = await this.userRepo.findOne({
        where: { id: user_id },
      });
      if (!addedUser) {
        throw new BadRequestException('User does not exist');
      }

      const currentUserChannel = await this.userChannelRepo.find({
        where: {
          user: { id: currentUserId },
          channel: { id: channel_id },
        },
        relations: ['user', 'channel'],
      });
      if (currentUserChannel.length === 0) {
        throw new BadRequestException('You are not a member of this channel');
      }

      const existingUserChannel = await this.userChannelRepo.findOne({
        where: {
          user: { id: user_id },
          channel: { id: channel_id },
        },
      });
      if (existingUserChannel) {
        throw new BadRequestException(
          'User is already a member of this channel',
        );
      }

      const userChannel = this.userChannelRepo.create({
        channel: channel,
        user: { id: user_id },
        role: role || ChannelRole.MEMBER,
      });
      await this.userChannelRepo.save(userChannel);
      return {
        message: 'User added to channel successfully',
        channel,
        user: addedUser,
      };
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

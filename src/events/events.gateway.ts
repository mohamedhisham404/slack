import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'src/types/jwt-payload.interface';
import { CustomSocket } from './types/socket.interface';
import {
  EmittedMessageDto,
  ServerToClientEvents,
} from './dto/emittedMessage.dto';

@WebSocketGateway()
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;
  users = new Map<number, string>();

  constructor(private jwtService: JwtService) {}

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: CustomSocket, channelId: number) {
    for (const room of client.rooms) {
      if (room.startsWith('channel_')) {
        await client.leave(room);
        Logger.log(`User ${client.data.userId} left room ${room}`);
      }
    }

    await client.join(`channel_${channelId}`);
    Logger.log(`User ${client.data.userId} joined room channel_${channelId}`);
  }

  async handleConnection(client: CustomSocket) {
    try {
      const token = client.handshake.headers['authorization']?.split(' ')[1];
      if (!token) throw new UnauthorizedException('No token provided');

      const payload: JwtPayload = this.jwtService.verify(token);

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userId = payload.userId;
      client.data = { userId };

      const rawChannelId = client.handshake.query.channelId;
      const channelId = Number(rawChannelId);

      if (userId) {
        this.users.set(userId, client.id);
        Logger.log(`User ${userId} connected with socket ID ${client.id}`);
      }

      if (!isNaN(channelId)) {
        await this.handleJoinChannel(client, channelId);
      }
    } catch (error: unknown) {
      Logger.error('Socket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: CustomSocket) {
    const userId = client.data.userId;
    if (userId) {
      this.users.delete(userId);
      Logger.log(`User ${userId} disconnected`);
    }
  }

  sendDirectMessage(userId: number, message: EmittedMessageDto) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newMessage', message);
    } else {
      Logger.warn(`User ${userId} is not connected`);
    }
  }

  sendMessageToChannel(
    channelId: number,
    message: EmittedMessageDto,
    senderSocket?: CustomSocket,
  ) {
    if (senderSocket) {
      senderSocket.to(`channel_${channelId}`).emit('newMessage', message);
    } else {
      // fallback: if no sender provided, send to everyone
      this.server.to(`channel_${channelId}`).emit('newMessage', message);
    }
  }
}

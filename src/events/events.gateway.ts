import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EmittedMessageDto, ServerToClientEvents } from './types/events';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  SendMessage(message: EmittedMessageDto) {
    this.server.emit('newMessage', message);
  }
}

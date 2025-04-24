import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway()
export class MessagesGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() raw: string) {
    try {
      const parsed: CreateMessageDto = JSON.parse(raw);
      console.log(parsed.user_id);
    } catch (e) {
      console.error('Invalid message format', e);
    }
  }
}

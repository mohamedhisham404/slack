import { Socket } from 'socket.io';
import { JwtPayload } from 'src/types/jwt-payload.interface';

export interface CustomSocket extends Socket {
  data: JwtPayload;
}

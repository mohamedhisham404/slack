import { Socket } from 'socket.io';
import { ClientData } from './client-data.interface';

export interface CustomSocket extends Socket {
  data: ClientData;
}

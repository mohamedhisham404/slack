// import { CreateAttachmentDto } from 'src/attachment/dto/create-attachment.dto';

export class EmittedMessageDto {
  content?: string;
  parent_message?: number;
  is_pinned?: boolean;
  // attachments?: CreateAttachmentDto[];
}

export interface ServerToClientEvents {
  newMessage: (payload: EmittedMessageDto) => void;
}

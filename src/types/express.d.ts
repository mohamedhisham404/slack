import { JwtPayload } from 'src/auth/types/jwt-payload.interface';

declare module 'express' {
  interface Request {
    user: JwtPayload;
  }
}

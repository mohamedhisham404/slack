import { Request } from 'express';
import { JwtPayload } from 'src/types/jwt-payload.interface';

export function getUserFromRequest(req: Request): JwtPayload | undefined {
  return req.user;
}

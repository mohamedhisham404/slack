import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JwtPayload } from 'src/types/jwt-payload.interface';
import { handleError } from 'src/utils/errorHandling';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromRequest(request);

      if (!token) {
        throw new UnauthorizedException('Token not found');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      request.user = payload;
      return true;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const cookieToken = request.cookies['accessToken'] as string;
    const authHeader = request.headers['authorization'];

    if (cookieToken) return cookieToken;

    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      return authHeader.split(' ')[1];
    }

    return undefined;
  }
}

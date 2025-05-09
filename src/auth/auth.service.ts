import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { loginDto } from './dto/logIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { setCookies } from 'src/utils/setCookies';
import { Request, Response } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface';
import { handleError } from 'src/utils/errorHandling';
import { isMobile } from 'src/utils/isMobile';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  async signup(signupData: CreateUserDto, res: Response, req: Request) {
    const { name, email, password, phone } = signupData;

    try {
      const existingUser = await this.userRepository.findOne({
        where: [{ email }, { phone }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictException('Email is already in use');
        }
        if (existingUser.phone === phone) {
          throw new ConflictException('Phone number is already in use');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await this.dataSource.transaction(async (manager) => {
        const savedUser = await manager.save(User, {
          name,
          email,
          password: hashedPassword,
          phone,
          preferences: {},
        });

        const tokens = this.generateToken(savedUser.id);

        return tokens;
      });

      const { accessToken, refreshToken } = result;

      if (isMobile(req)) {
        return res.status(201).json({
          accessToken,
          refreshToken,
          success: true,
        });
      } else {
        const accessMaxAge =
          this.configService.getOrThrow<number>('ACCESS_EXPIRES_MS');
        const refreshMaxAge =
          this.configService.getOrThrow<number>('REFRESH_EXPIRES_MS');

        setCookies(res, accessToken, refreshToken, accessMaxAge, refreshMaxAge);

        return res.status(201).json({
          statusCode: 201,
          message: 'User created successfully',
          success: true,
        });
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async login(loginData: loginDto, res: Response, req: Request) {
    const { email, password } = loginData;
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Email or password is incorrect');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Email or password is incorrect');
      }

      const { accessToken, refreshToken } = this.generateToken(user.id);

      if (isMobile(req)) {
        return res.status(201).json({
          accessToken,
          refreshToken,
          success: true,
        });
      } else {
        const accessMaxAge =
          this.configService.getOrThrow<number>('ACCESS_EXPIRES_MS');
        const refreshMaxAge =
          this.configService.getOrThrow<number>('REFRESH_EXPIRES_MS');

        setCookies(res, accessToken, refreshToken, accessMaxAge, refreshMaxAge);
        return res.status(200).json({
          statusCode: 200,
          message: 'User logged in successfully',
          success: true,
        });
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async refreshTokens(res: Response, req: Request) {
    const refreshToken = (req.cookies['refreshToken'] ||
      req.headers['authorization']?.split(' ')[1]) as string | undefined;

    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not provided');
      }

      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { accessToken, refreshToken: newRefreshToken } = this.generateToken(
        user.id,
      );

      const accessMaxAge =
        this.configService.getOrThrow<number>('ACCESS_EXPIRES_MS');
      const refreshMaxAge =
        this.configService.getOrThrow<number>('REFRESH_EXPIRES_MS');

      setCookies(
        res,
        accessToken,
        newRefreshToken,
        accessMaxAge,
        refreshMaxAge,
      );

      return res.status(201).json({
        statusCode: 201,
        message: 'Tokens refreshed successfully',
        success: true,
      });
    } catch (error: unknown) {
      handleError(error);
    }
  }

  logout(res: Response) {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.status(200).json({
        statusCode: 200,
        message: 'User logged out successfully',
        success: true,
      });
    } catch (error: unknown) {
      handleError(error);
    }
  }

  private generateToken(userId: string) {
    const accessExpiresIn = this.configService.get<string>('ACCESS_EXPIRES_IN');
    const refreshExpiresIn =
      this.configService.get<string>('REFRESH_EXPIRES_IN');

    const accessToken = this.jwtService.sign(
      { userId, type: 'access' },
      { expiresIn: accessExpiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { userId, type: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}

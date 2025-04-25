import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { loginDto } from './dto/logIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { setCookies } from 'src/utils/setCookies';
import { Request, Response } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupData: CreateUserDto, res: Response) {
    const { name, email, password, phone } = signupData;

    try {
      const emailInUse = await this.userRepository.findOne({
        where: { email: email },
      });

      if (emailInUse) {
        throw new BadRequestException('Email already in use');
      }

      if (phone) {
        const phoneInUse = await this.userRepository.findOne({
          where: { phone: phone },
        });

        if (phoneInUse) {
          throw new BadRequestException('Phone number already in use');
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      await this.userRepository.save(user);

      const { accessToken, refreshToken } = this.generateToken(user.id);
      setCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        statusCode: 201,
        message: 'User created successfully',
        success: true,
      });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to signup');
    }
  }

  async login(loginData: loginDto, res: Response) {
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

      setCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        statusCode: 201,
        message: 'User logged successfully',
        success: true,
      });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to signup');
    }
  }

  async refreshTokens(res: Response, req: Request) {
    const refreshToken = req.cookies['refreshToken'] as string;

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

      setCookies(res, accessToken, newRefreshToken);

      return res.status(201).json({
        statusCode: 201,
        message: 'Tokens refreshed successfully',
        success: true,
      });
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to signup');
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
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }

      throw new BadRequestException('Failed to signup');
    }
  }

  generateToken(userId: number) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign({ userId }, { expiresIn: '7d' });
    return {
      accessToken,
      refreshToken,
    };
  }
}

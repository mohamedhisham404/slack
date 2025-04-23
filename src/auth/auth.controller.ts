import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { loginDto } from './dto/logIn.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupData: CreateUserDto, @Res() res: Response) {
    return this.authService.signup(signupData, res);
  }

  @Post('login')
  async login(@Body() loginData: loginDto, @Res() res: Response) {
    return this.authService.login(loginData, res);
  }

  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshTokens(res, req);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}

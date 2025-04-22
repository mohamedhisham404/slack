import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private readonly entityManager: EntityManager) {}

  async signup(signupData: CreateUserDto) {}
}

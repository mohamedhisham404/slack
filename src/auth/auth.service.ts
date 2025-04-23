import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private readonly entityManager: EntityManager) {}

  async signup(signupData: CreateUserDto) {
    const {
      name,
      email,
      password,
      phone,
      profile_photo,
      status,
      is_active,
      about_me,
      last_login,
    } = signupData;

    const emailInUse = await this.entityManager.findOne('User', {
      where: { email: email },
    });

    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    if (phone) {
      const phoneInUse = await this.entityManager.findOne('User', {
        where: { phone: phone },
      });
      if (phoneInUse) {
        throw new BadRequestException('Phone number already in use');
      }
    }
  }
}

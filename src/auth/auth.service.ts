/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/models/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.usersService.create({ username, password: hashed } as User);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = { sub: user.id, username: user.username };
    user.password = undefined;

    return {
      message: 'Logged user',
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}

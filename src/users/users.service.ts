/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './models/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private user: Repository<User>) {}

  async create(user: User) {
    const { username, password } = user;

    if (!username || !password) {
      throw new BadRequestException('Name and password fields must be filled');
    }

    const userExists = await this.user.findOne({ where: { username } });
    if (userExists) {
      throw new BadRequestException('Username already registered');
    }

    await this.user.save(user);
    return { message: 'User created!' };
  }

  async findAll() {
    const response = await this.user.find({
      where: { deletedAt: IsNull() },
    });

    return response.map((item) => {
      const { password, ...rest } = item;
      return rest;
    });
  }

  findByUsername(username: string) {
    return this.user.findOne({ where: { username } });
  }

  async findOne(id: number) {
    const response = await this.user.findOne({ where: { id } });
    if (!response) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = response;
    return rest;
  }

  async update(id: number, body: User) {
    const data = await this.user.findOne({ where: { id } });
    if (!data) {
      throw new NotFoundException('User not found');
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    data.updatedAt = new Date();

    const response = await this.user.save({
      ...data,
      ...body,
    });

    const { password, ...rest } = response;
    return { message: 'Updated data', user: rest };
  }

  async softRemove(id: number) {
    const data = await this.user.findOne({ where: { id } });
    if (!data) {
      throw new NotFoundException('User not found');
    }

    data.deletedAt = new Date();
    const response = await this.user.save(data);

    const { password, ...rest } = response;
    return { message: 'Deleted user', user: rest };
  }

  async remove(id: number) {
    const user = await this.user.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.user.delete(id);
    return { message: 'Deleted user' };
  }
}

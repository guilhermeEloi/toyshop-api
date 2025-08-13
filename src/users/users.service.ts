/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './models/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  userRepository: any;
  constructor(@InjectRepository(User) private user: Repository<User>) {}

  async create(user: User) {
    const { username, password } = user;

    if (!username || !password)
      return { message: 'Name or password fields must be filled' };

    const userExists = await this.user.findOne({
      where: { username },
    });
    if (userExists) return { message: 'Username already registered' };

    await this.user.save(user);

    return { message: 'User created!' };
  }

  async findAll() {
    const response = await this.user.find({
      where: { deletedAt: IsNull() },
    });

    response.forEach((item) => {
      item.password = undefined;
    });
    return response;
  }

  findByUsername(username: string) {
    return this.user.findOne({ where: { username } });
  }

  async findOne(id: number) {
    const response = await this.user.findOne({
      where: { id },
    });
    if (!response) return { message: 'User not found' };

    response.password = undefined;
    return response;
  }

  async update(id: number, body: User) {
    const data = await this.user.findOne({ where: { id } });
    if (!data) return { message: 'User not found' };

    if (body.password) body.password = await bcrypt.hash(body.password, 10);

    data.updatedAt = new Date();

    const response = await this.user.save({
      ...data,
      ...body,
    });

    return { message: 'Updated data', user: response };
  }

  async softRemove(id: number) {
    const data = await this.user.findOne({ where: { id } });
    if (!data) return { message: 'User not found' };

    data.deletedAt = new Date();

    const response = await this.user.save({ ...data });

    return {
      message: 'Deleted user',
      user: response,
    };
  }

  remove(id: number) {
    return {
      message: 'Deleted user',
      data: this.user.delete(id),
    };
  }
}

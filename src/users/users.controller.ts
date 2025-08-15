import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './models/user.entity';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  async create(@Body() post: User) {
    return await this.users.create(post);
  }

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: User) {
    return this.users.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.users.softRemove(id);
  }
}

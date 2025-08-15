import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './models/customer.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  create(@Body() customer: Customer) {
    return this.service.create(customer);
  }

  @Get()
  list(@Query('name') name?: string, @Query('email') email?: string) {
    return this.service.findAll({ name, email });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() customer: Customer) {
    return this.service.update(+id, customer);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.softRemove(+id);
  }
}

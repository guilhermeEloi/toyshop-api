import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { SalesService } from './sales.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Sale } from './models/sale.entity';

@Controller('customers/:customerId/sales')
@UseGuards(AuthGuard)
export class SalesController {
  constructor(private service: SalesService) {}

  @Post()
  create(@Param('customerId') customerId: string, @Body() sale: Sale) {
    return this.service.create(+customerId, sale);
  }

  @Get()
  list(@Param('customerId') customerId: string) {
    return this.service.listByCustomer(+customerId);
  }
}

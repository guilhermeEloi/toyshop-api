import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { Sale } from './models/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private repo: Repository<Sale>,
    private customers: CustomersService,
  ) {}

  async create(customerId: number, sale: Sale) {
    await this.customers.findOne(customerId);

    const entity = this.repo.create({ ...sale, customerId });
    return this.repo.save(entity);
  }

  listByCustomer(customerId: number) {
    return this.repo.find({ where: { customerId } });
  }

  async getAll() {
    return this.repo.find();
  }
}

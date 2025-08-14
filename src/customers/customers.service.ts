import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { Customer } from './models/customer.entity';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}

  async create(customer: Customer) {
    const exists = await this.repo.findOne({
      where: { email: customer.email, deletedAt: IsNull() },
    });
    if (exists) throw new BadRequestException('E-mail already registered');
    const entity = this.repo.create({ ...customer });
    return this.repo.save(entity);
  }

  async findAll(filter?: { name?: string; email?: string }) {
    const baseCondition = { deletedAt: IsNull() };

    if (filter?.name || filter?.email) {
      const conditions: any[] = [];

      if (filter.name) {
        conditions.push({ ...baseCondition, name: ILike(`%${filter.name}%`) });
      }

      if (filter.email) {
        conditions.push({
          ...baseCondition,
          email: ILike(`%${filter.email}%`),
        });
      }

      return this.repo.find({
        where: conditions,
        relations: ['sales'],
        order: { name: 'ASC' },
      });
    }

    return this.repo.find({
      where: baseCondition,
      relations: ['sales'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['sales'],
    });
    if (!found) throw new NotFoundException('Client not found');
    return found;
  }

  async update(id: number, customer: Customer) {
    const found = await this.findOne(id);
    if (customer.email) {
      const exists = await this.repo.findOne({
        where: { email: customer.email, id: Not(id), deletedAt: IsNull() },
      });
      if (exists)
        throw new BadRequestException('Email já cadastrado por outro cliente');
    }
    Object.assign(found, { ...customer, updatedAt: new Date() });
    return this.repo.save(found);
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    found.deletedAt = new Date();
    return this.repo.save(found);
  }
}

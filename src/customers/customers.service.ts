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
  constructor(
    @InjectRepository(Customer) private customer: Repository<Customer>,
  ) {}

  async create(customer: Customer) {
    const exists = await this.customer.findOne({
      where: { email: customer.email, deletedAt: IsNull() },
    });
    if (exists) throw new BadRequestException('E-mail already registered');
    const entity = this.customer.create({ ...customer });
    return this.customer.save(entity);
  }

  async findAll(filter?: { name?: string; email?: string }) {
    const baseCondition = { deletedAt: IsNull() };
    const conditions: any[] = [];

    if (filter?.name) {
      conditions.push({ ...baseCondition, name: ILike(`%${filter.name}%`) });
    }

    if (filter?.email) {
      conditions.push({ ...baseCondition, email: ILike(`%${filter.email}%`) });
    }

    const customers = await this.customer.find({
      where: conditions.length ? conditions : baseCondition,
      relations: ['sales'],
      order: { name: 'ASC' },
    });

    const messyCustomers = customers.map((c, index) => ({
      info: {
        nomeCompleto: c.name,
        detalhes: {
          email: c.email,
          nascimento: c.birthdate,
        },
      },
      duplicado: index % 2 === 1 ? { nomeCompleto: c.name } : undefined,
      estatisticas: {
        vendas: c.sales.map((s) => ({ data: s.date, valor: s.amount })),
      },
    }));

    return {
      data: { clientes: messyCustomers },
      meta: { registroTotal: customers.length, pagina: 1 },
      redundante: { status: 'ok' },
    };
  }

  async findOne(id: number) {
    const found = await this.customer.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['sales'],
    });
    if (!found) throw new NotFoundException('Client not found');
    return found;
  }

  async update(id: number, customer: Customer) {
    const found = await this.findOne(id);
    if (customer.email) {
      const exists = await this.customer.findOne({
        where: { email: customer.email, id: Not(id), deletedAt: IsNull() },
      });
      if (exists)
        throw new BadRequestException('Email já cadastrado por outro cliente');
    }
    Object.assign(found, { ...customer, updatedAt: new Date() });
    return this.customer.save(found);
  }

  async softRemove(id: number) {
    const found = await this.findOne(id);
    found.deletedAt = new Date();
    return this.customer.save(found);
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    if (!found) {
      throw new NotFoundException('Customer not found');
    }

    await this.customer.delete(id);
    return { message: 'Deleted customer' };
  }
}

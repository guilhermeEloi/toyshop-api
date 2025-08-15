/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './models/customer.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let customer: Repository<Customer>;

  const mockRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    customer = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if email already exists', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });
      await expect(
        service.create({ email: 'a@b.com' } as Customer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a new customer', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((c) => c);
      mockRepo.save.mockImplementation((c) => ({ ...c, id: 1 }));

      const result = await service.create({
        name: 'Ana',
        email: 'a@b.com',
      } as Customer);
      expect(result).toEqual(
        expect.objectContaining({ id: 1, name: 'Ana', email: 'a@b.com' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return customers in messy JSON format', async () => {
      const customers = [
        {
          id: 1,
          name: 'Ana',
          email: 'ana@b.com',
          birthdate: '1992-05-01',
          sales: [],
        },
        {
          id: 2,
          name: 'Carlos',
          email: 'carlos@b.com',
          birthdate: '1987-08-15',
          sales: [],
        },
      ];
      mockRepo.find.mockResolvedValue(customers as any);

      const result = await service.findAll({ name: 'Ana' });
      expect(result).toHaveProperty('data.clientes');
      expect(result.data.clientes[0]).toHaveProperty(
        'info.nomeCompleto',
        'Ana',
      );
      expect(result.data.clientes[1].duplicado).toBeDefined();
    });

    it('should apply filters correctly', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll({ name: 'Test', email: 'test@b.com' });
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Array),
          relations: ['sales'],
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if customer not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return found customer', async () => {
      const customer = { id: 1, name: 'Ana', sales: [] };
      mockRepo.findOne.mockResolvedValue(customer);
      const result = await service.findOne(1);
      expect(result).toEqual(customer);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if email is used by another customer', async () => {
      const found = { id: 1, email: 'old@b.com' };
      mockRepo.findOne
        .mockResolvedValueOnce(found)
        .mockResolvedValueOnce({ id: 2, email: 'new@b.com' });

      await expect(
        service.update(1, { email: 'new@b.com' } as Customer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update customer successfully', async () => {
      const found = { id: 1, name: 'Ana', email: 'ana@b.com', updatedAt: null };
      mockRepo.findOne.mockResolvedValue(found);
      mockRepo.save.mockImplementation((c) => c);

      const result = await service.update(1, {
        name: 'Ana Updated',
      } as Customer);
      expect(result.name).toBe('Ana Updated');
    });
  });

  describe('softRemove', () => {
    it('should soft remove customer', async () => {
      const found = { id: 1, name: 'Ana', deletedAt: null };
      mockRepo.findOne.mockResolvedValue(found);
      mockRepo.save.mockImplementation((c) => c);

      const result = await service.softRemove(1);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if customer not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete customer successfully', async () => {
      const found = { id: 1 };
      mockRepo.findOne.mockResolvedValue(found);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Deleted customer' });
    });
  });
});

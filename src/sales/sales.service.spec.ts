/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { CustomersService } from '../customers/customers.service';
import { Sale } from './models/sale.entity';

describe('SalesService', () => {
  let service: SalesService;
  let repoMock: any;
  let customersMock: any;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    customersMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: CustomersService, useValue: customersMock },
        { provide: 'SaleRepository', useValue: repoMock },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);

    (service as any).repo = repoMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repo.create and repo.save with correct data', async () => {
      const sale: Sale = { amount: 100, date: '2024-01-01' } as Sale;
      customersMock.findOne.mockResolvedValue({ id: 1 });
      repoMock.create.mockReturnValue(sale);
      repoMock.save.mockResolvedValue({ ...sale, id: 1, customerId: 1 });

      const result = await service.create(1, sale);

      expect(customersMock.findOne).toHaveBeenCalledWith(1);
      expect(repoMock.create).toHaveBeenCalledWith({ ...sale, customerId: 1 });
      expect(repoMock.save).toHaveBeenCalledWith(sale);
      expect(result).toEqual({ ...sale, id: 1, customerId: 1 });
    });
  });

  describe('listByCustomer', () => {
    it('should call repo.find with correct customerId', async () => {
      const salesList = [{ id: 1, amount: 100, customerId: 1 }];
      repoMock.find.mockResolvedValue(salesList);

      const result = await service.listByCustomer(1);

      expect(repoMock.find).toHaveBeenCalledWith({ where: { customerId: 1 } });
      expect(result).toEqual(salesList);
    });
  });

  describe('getAll', () => {
    it('should call repo.find and return all sales', async () => {
      const allSales = [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 },
      ];
      repoMock.find.mockResolvedValue(allSales);

      const result = await service.getAll();

      expect(repoMock.find).toHaveBeenCalled();
      expect(result).toEqual(allSales);
    });
  });
});

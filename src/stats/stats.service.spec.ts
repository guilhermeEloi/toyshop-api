/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { DataSource } from 'typeorm';

describe('StatsService', () => {
  let service: StatsService;
  let dataSourceMock: Partial<DataSource>;

  beforeEach(async () => {
    dataSourceMock = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('salesByDay', () => {
    it('should return sales total grouped by date', async () => {
      const mockRows = [
        { date: '2024-01-01', total: '150' },
        { date: '2024-01-02', total: '200' },
      ];
      (dataSourceMock.query as jest.Mock).mockResolvedValue(mockRows);

      const result = await service.salesByDay();

      expect(dataSourceMock.query).toHaveBeenCalled();
      expect(result).toEqual([
        { date: '2024-01-01', total: 150 },
        { date: '2024-01-02', total: 200 },
      ]);
    });
  });

  describe('topCustomers', () => {
    it('should return highest total, highest average, and highest frequency', async () => {
      const mockRows = [
        {
          customerId: 1,
          name: 'Ana',
          email: 'ana@example.com',
          total: 300,
          avg: 150,
          unique_days: 2,
        },
        {
          customerId: 2,
          name: 'Carlos',
          email: 'carlos@example.com',
          total: 500,
          avg: 250,
          unique_days: 1,
        },
      ];
      (dataSourceMock.query as jest.Mock).mockResolvedValue(mockRows);

      const result = await service.topCustomers();

      expect(dataSourceMock.query).toHaveBeenCalled();
      expect(result.highestTotal.customerId).toBe(2);
      expect(result.highestAvg.customerId).toBe(2);
      expect(result.highestFrequency.customerId).toBe(1);
    });

    it('should return nulls if no rows found', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([]);

      const result = await service.topCustomers();

      expect(result).toEqual({
        highestTotal: null,
        highestAvg: null,
        highestFrequency: null,
      });
    });
  });
});

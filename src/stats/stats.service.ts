/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class StatsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async salesByDay() {
    const rows = await this.dataSource.query(`
      SELECT date AS date, SUM(amount)::float AS total
      FROM sales
      GROUP BY date
      ORDER BY date ASC
    `);

    return rows.map((r: any) => ({
      date: r.date,
      total: Number(r.total),
    }));
  }

  async topCustomers() {
    const rows = await this.dataSource.query(`
      SELECT
        s."customerId" AS "customerId",
        c.name,
        c.email,
        SUM(s.amount)::float AS total,
        AVG(s.amount)::float AS avg,
        COUNT(DISTINCT s.date)::int AS unique_days
      FROM sales s
      JOIN customers c ON c.id = s."customerId"
      WHERE c."deletedAt" IS NULL
      GROUP BY s."customerId", c.name, c.email
    `);

    if (!rows.length) {
      return {
        highestTotal: null,
        highestAvg: null,
        highestFrequency: null,
      };
    }

    const highestTotal = rows.reduce((a, b) => (a.total >= b.total ? a : b));
    const highestAvg = rows.reduce((a, b) => (a.avg >= b.avg ? a : b));
    const highestFrequency = rows.reduce((a, b) =>
      a.unique_days >= b.unique_days ? a : b,
    );

    return { highestTotal, highestAvg, highestFrequency };
  }
}

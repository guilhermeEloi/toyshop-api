/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('stats')
@UseGuards(AuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('sales-by-day')
  salesByDay() {
    return this.statsService.salesByDay();
  }

  @Get('top-customers')
  topCustomers() {
    return this.statsService.topCustomers();
  }
}

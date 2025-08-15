import { Customer } from 'src/customers/models/customer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('date')
  date: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Customer, (c) => c.sales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Index()
  @Column()
  customerId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

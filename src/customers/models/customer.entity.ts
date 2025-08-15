import { Sale } from 'src/sales/models/sale.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ type: 'date', nullable: true })
  birthdate: string | null;

  @OneToMany(() => Sale, (s) => s.customer)
  sales: Sale[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

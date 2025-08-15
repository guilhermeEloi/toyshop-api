import { Column, Entity } from 'typeorm';

@Entity('auth')
export class AuthEntity {
  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  password: string;
}

import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { BookingService } from './booking-service.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

@Entity('bookings')
@Index(['shopId', 'startTime'])
@Index(['staffId', 'startTime'])
@Index(['customerId'])
export class Booking extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('uuid', { nullable: true })
  staffId: string | null;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'staffId' })
  staff: User;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int' })
  totalDuration: number;

  @Column({ type: 'text', nullable: true })
  customerNotes: string | null;

  @Column({ type: 'text', nullable: true })
  staffNotes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  cancelReason: string | null;

  @Column({ type: 'varchar', nullable: true })
  cancelledBy: string | null;

  @Column({ default: false })
  reminderSent: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => BookingService, (bs) => bs.booking, { cascade: true })
  services: BookingService[];
}

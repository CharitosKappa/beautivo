import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Booking } from './booking.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('booking_services')
export class BookingService extends BaseEntity {
  @Column('uuid')
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column('uuid')
  serviceId: string;

  @ManyToOne(() => Service, (service) => service.bookingServices)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ default: 0 })
  sortOrder: number;
}

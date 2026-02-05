import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Service } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Role } from '../../roles/entities/role.entity';
import { ShopWorkingHours } from './shop-working-hours.entity';
import { ShopSpecialDay } from './shop-special-day.entity';

export interface ShopSettings {
  minBookingNotice: number;
  maxAdvanceBooking: number;
  bufferTime: number;
  cancellationDeadline: number;
  employeeSelection: 'mandatory' | 'optional' | 'disabled';
  defaultBookingStatus: 'pending' | 'confirmed';
  requirePhone: boolean;
  allowNotes: boolean;
}

@Entity('shops')
export class Shop extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string | null;

  @Column({ default: 'GR' })
  country: string;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ default: 'Europe/Athens' })
  timezone: string;

  @Column({ type: 'jsonb', default: {} })
  settings: ShopSettings;

  @Column({ type: 'varchar', nullable: true })
  logo: string | null;

  @Column({ type: 'varchar', nullable: true })
  coverImage: string | null;

  @Column({ type: 'simple-array', default: '' })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Category, (category) => category.shop)
  categories: Category[];

  @OneToMany(() => Service, (service) => service.shop)
  services: Service[];

  @OneToMany(() => User, (user) => user.shop)
  users: User[];

  @OneToMany(() => Customer, (customer) => customer.shop)
  customers: Customer[];

  @OneToMany(() => Booking, (booking) => booking.shop)
  bookings: Booking[];

  @OneToMany(() => Role, (role) => role.shop)
  roles: Role[];

  @OneToMany(() => ShopWorkingHours, (hours) => hours.shop)
  workingHours: ShopWorkingHours[];

  @OneToMany(() => ShopSpecialDay, (day) => day.shop)
  specialDays: ShopSpecialDay[];
}

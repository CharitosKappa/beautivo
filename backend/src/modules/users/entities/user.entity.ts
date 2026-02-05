import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Role } from '../../roles/entities/role.entity';
import { Service } from '../../services/entities/service.entity';
import { UserSchedule } from './user-schedule.entity';
import { UserTimeBlock } from './user-time-block.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column('uuid', { nullable: true })
  shopId: string | null;

  @ManyToOne(() => Shop, (shop) => shop.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column('uuid')
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  totpSecret: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => UserSchedule, (schedule) => schedule.user)
  schedules: UserSchedule[];

  @OneToMany(() => UserTimeBlock, (block) => block.user)
  timeBlocks: UserTimeBlock[];

  @ManyToMany(() => Service, (service) => service.staff)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.staff)
  bookings: Booking[];
}

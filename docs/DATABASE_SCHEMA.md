# Database Schema

## Overview

The database uses PostgreSQL with TypeORM as the ORM. All tables use UUIDs as primary keys for security and distributed system compatibility. Timestamps are stored in UTC, and soft deletes are implemented where appropriate.

## TypeORM Configuration

TypeORM integrates seamlessly with NestJS through the official `@nestjs/typeorm` package. Entities are defined using TypeScript decorators, which fits naturally with the NestJS coding style.

### Installation

```bash
npm install @nestjs/typeorm typeorm pg
```

### Configuration in app.module.ts

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'beautivo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class AppModule {}
```

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Shop     │       │   Category  │       │   Service   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │──┐    │ id          │
│ name        │  │    │ shopId      │◄─┤    │ shopId      │
│ description │  │    │ name        │  │    │ categoryId  │◄─┘
│ email       │  │    │ description │  │    │ name        │
│ phone       │  │    │ sortOrder   │  │    │ description │
│ address     │  │    │ isActive    │  │    │ duration    │
│ city        │  │    │ createdAt   │  │    │ price       │
│ postalCode  │  │    │ updatedAt   │  │    │ bufferTime  │
│ country     │  │    └─────────────┘  │    │ isActive    │
│ latitude    │  │                     │    │ createdAt   │
│ longitude   │  │                     │    │ updatedAt   │
│ timezone    │  │                     │    └──────┬──────┘
│ settings    │  │                     │           │
│ createdAt   │  │                     │           │
│ updatedAt   │  │                     │           │
└──────┬──────┘  │                     │           │
       │         │    ┌────────────────┴───────────┘
       │         │    │
       │         │    ▼
       │         │  ┌─────────────────┐
       │         │  │ ServiceStaff    │
       │         │  │ (junction)      │
       │         │  ├─────────────────┤
       │         │  │ serviceId       │◄──────────┐
       │         │  │ staffId         │◄────────┐ │
       │         │  └─────────────────┘         │ │
       │         │                              │ │
       │         │    ┌─────────────┐           │ │
       │         │    │    Role     │           │ │
       │         │    ├─────────────┤           │ │
       │         ├───►│ id          │           │ │
       │         │    │ shopId      │           │ │
       │         │    │ name        │           │ │
       │         │    │ permissions │           │ │
       │         │    │ isDefault   │           │ │
       │         │    │ createdAt   │           │ │
       │         │    │ updatedAt   │           │ │
       │         │    └──────┬──────┘           │ │
       │         │           │                  │ │
       │         │           ▼                  │ │
       │         │    ┌─────────────┐           │ │
       │         │    │    User     │           │ │
       │         │    │   (Staff)   │           │ │
       │         │    ├─────────────┤           │ │
       │         ├───►│ id          │───────────┘ │
       │         │    │ shopId      │             │
       │         │    │ roleId      │◄────────────┤
       │         │    │ email       │             │
       │         │    │ password    │             │
       │         │    │ firstName   │             │
       │         │    │ lastName    │             │
       │         │    │ phone       │             │
       │         │    │ avatar      │             │
       │         │    │ is2FAEnabled│             │
       │         │    │ totpSecret  │             │
       │         │    │ isActive    │             │
       │         │    │ createdAt   │             │
       │         │    │ updatedAt   │             │
       │         │    └──────┬──────┘             │
       │         │           │                    │
       │         │           │                    │
       │         │    ┌──────▼──────┐             │
       │         │    │  Schedule   │             │
       │         │    ├─────────────┤             │
       │         │    │ id          │             │
       │         │    │ userId      │             │
       │         │    │ dayOfWeek   │             │
       │         │    │ startTime   │             │
       │         │    │ endTime     │             │
       │         │    │ isWorking   │             │
       │         │    └─────────────┘             │
       │         │                                │
       │         │    ┌─────────────┐             │
       │         │    │ TimeBlock   │             │
       │         │    ├─────────────┤             │
       │         │    │ id          │             │
       │         │    │ userId      │◄────────────┤
       │         │    │ date        │             │
       │         │    │ startTime   │             │
       │         │    │ endTime     │             │
       │         │    │ reason      │             │
       │         │    │ isRecurring │             │
       │         │    └─────────────┘             │
       │         │                                │
       │         │    ┌─────────────┐             │
       │         │    │  Customer   │             │
       │         │    ├─────────────┤             │
       │         ├───►│ id          │◄──────────┐ │
       │              │ shopId      │           │ │
       │              │ email       │           │ │
       │              │ firstName   │           │ │
       │              │ lastName    │           │ │
       │              │ phone       │           │ │
       │              │ notes       │           │ │
       │              │ createdAt   │           │ │
       │              │ updatedAt   │           │ │
       │              │ deletedAt   │           │ │
       │              └─────────────┘           │ │
       │                                        │ │
       │              ┌─────────────┐           │ │
       │              │   Booking   │           │ │
       │              ├─────────────┤           │ │
       └─────────────►│ id          │           │ │
                      │ shopId      │           │ │
                      │ customerId  │◄──────────┘ │
                      │ staffId     │◄────────────┤
                      │ status      │             │
                      │ startTime   │             │
                      │ endTime     │             │
                      │ totalPrice  │             │
                      │ totalDurat. │             │
                      │ notes       │             │
                      │ cancelledAt │             │
                      │ cancelReason│             │
                      │ createdAt   │             │
                      │ updatedAt   │             │
                      │ deletedAt   │             │
                      └──────┬──────┘             │
                             │                    │
                             ▼                    │
                      ┌──────────────┐            │
                      │BookingService│            │
                      │  (junction)  │            │
                      ├──────────────┤            │
                      │ id           │            │
                      │ bookingId    │            │
                      │ serviceId    │◄───────────┘
                      │ serviceName  │
                      │ price        │
                      │ duration     │
                      │ sortOrder    │
                      └──────────────┘
```

## TypeORM Entities

### Base Entity

Create a base entity that other entities can extend:

```typescript
// src/common/entities/base.entity.ts

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

### Shop Entity

```typescript
// src/modules/shops/entities/shop.entity.ts

import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
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
  minBookingNotice: number;      // minutes
  maxAdvanceBooking: number;     // days
  bufferTime: number;            // minutes
  cancellationDeadline: number;  // minutes
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
  description: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  // Address
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: 'GR' })
  country: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  // Settings
  @Column({ default: 'Europe/Athens' })
  timezone: string;

  @Column({ type: 'jsonb', default: {} })
  settings: ShopSettings;

  // Media
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'simple-array', default: '' })
  images: string[];

  // Status
  @Column({ default: true })
  isActive: boolean;

  // Relations
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
```

### Shop Working Hours Entity

```typescript
// src/modules/shops/entities/shop-working-hours.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from './shop.entity';

@Entity('shop_working_hours')
@Unique(['shopId', 'dayOfWeek'])
export class ShopWorkingHours extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.workingHours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'int' }) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayOfWeek: number;

  @Column() // "09:00" format
  startTime: string;

  @Column() // "18:00" format
  endTime: string;

  @Column({ default: true })
  isOpen: boolean;
}
```

### Shop Special Day Entity

```typescript
// src/modules/shops/entities/shop-special-day.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from './shop.entity';

@Entity('shop_special_days')
@Unique(['shopId', 'date'])
export class ShopSpecialDay extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.specialDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: true })
  isClosed: boolean;

  @Column({ nullable: true })
  startTime: string;

  @Column({ nullable: true })
  endTime: string;

  @Column({ nullable: true })
  reason: string;
}
```

### Category Entity

```typescript
// src/modules/categories/entities/category.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
```

### Service Entity

```typescript
// src/modules/services/entities/service.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { BookingService } from '../../bookings/entities/booking-service.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column('uuid', { nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.services, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ type: 'int' }) // Duration in minutes
  duration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true }) // Override shop default buffer time
  bufferTime: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToMany(() => User, (user) => user.services)
  @JoinTable({
    name: 'service_staff',
    joinColumn: { name: 'serviceId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  staff: User[];

  @OneToMany(() => BookingService, (bs) => bs.service)
  bookingServices: BookingService[];
}
```

### Role Entity

```typescript
// src/modules/roles/entities/role.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column('uuid', { nullable: true }) // null for system roles (Super Admin)
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', default: '' })
  permissions: string[];

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: false })
  isDefault: boolean;

  // Relations
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
```

### User Entity (Staff)

```typescript
// src/modules/users/entities/user.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
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
  @Column('uuid', { nullable: true }) // null for Super Admin
  shopId: string;

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

  @Column() // bcrypt hashed
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  // 2FA
  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ nullable: true }) // Encrypted TOTP secret
  totpSecret: string;

  // Status
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  // Relations
  @OneToMany(() => UserSchedule, (schedule) => schedule.user)
  schedules: UserSchedule[];

  @OneToMany(() => UserTimeBlock, (block) => block.user)
  timeBlocks: UserTimeBlock[];

  @ManyToMany(() => Service, (service) => service.staff)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.staff)
  bookings: Booking[];
}
```

### User Schedule Entity

```typescript
// src/modules/users/entities/user-schedule.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_schedules')
@Unique(['userId', 'dayOfWeek'])
export class UserSchedule extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' }) // 0-6
  dayOfWeek: number;

  @Column() // "09:00"
  startTime: string;

  @Column() // "18:00"
  endTime: string;

  @Column({ default: true })
  isWorking: boolean;
}
```

### User Time Block Entity

```typescript
// src/modules/users/entities/user-time-block.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_time_blocks')
export class UserTimeBlock extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.timeBlocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // For recurring blocks (like lunch break)
  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: 'int', nullable: true }) // Only for recurring
  dayOfWeek: number;

  // For one-time blocks (day off, vacation)
  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column() // "12:00"
  startTime: string;

  @Column() // "13:00"
  endTime: string;

  @Column({ nullable: true }) // "Lunch", "Personal", "Vacation"
  reason: string;
}
```

### Customer Entity

```typescript
// src/modules/customers/entities/customer.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('customers')
@Unique(['shopId', 'email'])
export class Customer extends BaseEntity {
  @Column('uuid')
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.customers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column()
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true }) // Internal notes about customer
  notes: string;

  // For passwordless auth
  @Column({ nullable: true })
  otpHash: string;

  @Column({ type: 'timestamptz', nullable: true })
  otpExpiry: Date;

  // Soft delete
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];
}
```

### Booking Entity

```typescript
// src/modules/bookings/entities/booking.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  DeleteDateColumn,
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

  @Column('uuid', { nullable: true }) // Can be null if employee selection is disabled
  staffId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'staffId' })
  staff: User;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  // Timing (stored in UTC)
  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  // Calculated totals (denormalized for performance)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'int' }) // Total minutes
  totalDuration: number;

  // Notes
  @Column({ type: 'text', nullable: true }) // Notes from customer
  customerNotes: string;

  @Column({ type: 'text', nullable: true }) // Internal notes
  staffNotes: string;

  // Cancellation
  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ nullable: true }) // "customer" | "staff" | userId
  cancelledBy: string;

  // Reminder tracking
  @Column({ default: false })
  reminderSent: boolean;

  // Soft delete
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => BookingService, (bs) => bs.booking, { cascade: true })
  services: BookingService[];
}
```

### Booking Service Entity

```typescript
// src/modules/bookings/entities/booking-service.entity.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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

  // Snapshot of service details at booking time
  @Column()
  serviceName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ default: 0 })
  sortOrder: number;
}
```

### Notification Log Entity

```typescript
// src/modules/notifications/entities/notification-log.entity.ts

import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  VIBER = 'VIBER',
}

@Entity('notification_logs')
@Index(['bookingId'])
export class NotificationLog extends BaseEntity {
  @Column('uuid', { nullable: true })
  bookingId: string;

  @Column('uuid', { nullable: true })
  customerId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column() // Email or phone number
  recipient: string;

  @Column() // "sent", "failed", "pending"
  status: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;
}
```

### Refresh Token Entity

```typescript
// src/modules/auth/entities/refresh-token.entity.ts

import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId'])
@Index(['customerId'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column('uuid', { nullable: true })
  customerId: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

## Permission Strings Reference

The following permission strings are used in the Role.permissions array.

For bookings: `bookings.view`, `bookings.view_own`, `bookings.create`, `bookings.update`, `bookings.delete`

For services: `services.view`, `services.create`, `services.update`, `services.delete`

For categories: `categories.view`, `categories.manage`

For staff: `staff.view`, `staff.create`, `staff.update`, `staff.delete`

For customers: `customers.view`, `customers.update`, `customers.delete`, `customers.notes`

For settings: `settings.view`, `settings.update`, `settings.hours`, `settings.booking`

For roles: `roles.view`, `roles.create`, `roles.update`, `roles.delete`

For reports: `reports.view`, `reports.export`

## Default System Roles

The Shop Admin role has all permissions. The Staff role has basic permissions including `bookings.view`, `bookings.view_own`, `bookings.create`, `bookings.update`, `services.view`, `customers.view`, and `customers.notes`. The Super Admin role has all permissions plus a `super_admin` flag for platform-wide access.

## Migrations

### Creating Migrations

TypeORM can generate migrations from entity changes:

```bash
# Generate a migration based on entity changes
npm run typeorm migration:generate -- -n MigrationName

# Run pending migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

### Package.json Scripts

Add these scripts to your backend package.json:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/config/typeorm.config.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/config/typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/config/typeorm.config.ts"
  }
}
```

## Soft Delete Strategy

The following entities implement soft delete with a `deletedAt` timestamp using TypeORM's `@DeleteDateColumn`:
- Customer - preserves booking history
- Booking - preserves records for reporting

To query including soft-deleted records:
```typescript
repository.find({ withDeleted: true })
```

## Repository Pattern

Each module should have a repository for database operations. TypeORM repositories can be injected directly or extended:

```typescript
// In a service
@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(shopId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { shopId },
      relations: ['customer', 'staff', 'services'],
    });
  }
}
```

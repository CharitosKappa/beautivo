import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_time_blocks')
export class UserTimeBlock extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.timeBlocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: 'int', nullable: true })
  dayOfWeek: number | null;

  @Column({ type: 'date', nullable: true })
  date: Date | null;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;
}

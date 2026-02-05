import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
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

  @Column({ type: 'int' })
  dayOfWeek: number;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ default: true })
  isWorking: boolean;
}

import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
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

  @Column({ type: 'varchar', nullable: true })
  startTime: string | null;

  @Column({ type: 'varchar', nullable: true })
  endTime: string | null;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;
}

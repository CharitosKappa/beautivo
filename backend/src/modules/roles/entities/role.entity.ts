import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column('uuid', { nullable: true })
  shopId: string | null;

  @ManyToOne(() => Shop, (shop) => shop.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'simple-array', default: '' })
  permissions: string[];

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

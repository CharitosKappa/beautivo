import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';

export interface JwtPayload {
  sub: string;
  type: 'user' | 'customer';
  shopId?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.accessTokenSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'user') {
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        type: 'user',
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        shopId: user.shopId,
        roleId: user.roleId,
        role: user.role,
        permissions: user.role?.permissions ?? payload.permissions ?? [],
      };
    }

    if (payload.type === 'customer') {
      const customer = await this.customersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!customer) {
        throw new UnauthorizedException();
      }

      return {
        type: 'customer',
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        shopId: customer.shopId,
      };
    }

    throw new UnauthorizedException();
  }
}

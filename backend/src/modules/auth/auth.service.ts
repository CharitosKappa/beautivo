import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { Confirm2faDto } from './dto/confirm-2fa.dto';
import { Disable2faDto } from './dto/disable-2fa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

interface AuthConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  tempTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  tempTokenExpiresIn: string;
  bcryptRounds: number;
}

interface OtpAttemptState {
  count: number;
  expiresAt: number;
}

interface OtpRequestState {
  timestamps: number[];
}

@Injectable()
export class AuthService {
  private otpAttempts = new Map<string, OtpAttemptState>();
  private otpRequests = new Map<string, OtpRequestState>();

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  private get authConfig(): AuthConfig {
    return this.configService.get<AuthConfig>('auth') as AuthConfig;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private assertPasswordStrength(password: string) {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      throw new BadRequestException('Password does not meet complexity requirements');
    }
  }

  private otpKey(shopId: string, email: string) {
    return `${shopId}:${email}`;
  }

  private enforceOtpRequestLimit(key: string) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 3;
    const entry = this.otpRequests.get(key) ?? { timestamps: [] };
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      throw new BadRequestException('OTP request limit exceeded');
    }

    entry.timestamps.push(now);
    this.otpRequests.set(key, entry);
  }

  private resetOtpAttempts(key: string, expiresAt: Date) {
    this.otpAttempts.set(key, {
      count: 0,
      expiresAt: expiresAt.getTime(),
    });
  }

  private registerOtpFailure(key: string) {
    const entry = this.otpAttempts.get(key);
    if (!entry) {
      return;
    }
    entry.count += 1;
    this.otpAttempts.set(key, entry);
  }

  private hasExceededOtpAttempts(key: string) {
    const entry = this.otpAttempts.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.otpAttempts.delete(key);
      return false;
    }
    return entry.count >= 5;
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = /^(\d+)([smhd])?$/.exec(expiresIn);
    if (!match) {
      return 0;
    }
    const value = Number(match[1]);
    const unit = match[2] ?? 's';
    switch (unit) {
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      case 's':
      default:
        return value;
    }
  }

  private buildExpiryDate(expiresIn: string) {
    const seconds = this.parseExpiresIn(expiresIn);
    return new Date(Date.now() + seconds * 1000);
  }

  private async issueAccessToken(payload: Record<string, unknown>) {
    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.accessTokenSecret,
      expiresIn: this.authConfig.accessTokenExpiresIn,
    });
  }

  private async issueRefreshToken(payload: Record<string, unknown>) {
    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.refreshTokenSecret,
      expiresIn: this.authConfig.refreshTokenExpiresIn,
    });
  }

  private async issueTempToken(payload: Record<string, unknown>) {
    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.tempTokenSecret,
      expiresIn: this.authConfig.tempTokenExpiresIn,
    });
  }

  async requestCustomerOtp(dto: RequestOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const shop = await this.shopsRepository.findOne({ where: { id: dto.shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const key = this.otpKey(dto.shopId, email);
    this.enforceOtpRequestLimit(key);

    let customer = await this.customersRepository.findOne({
      where: { shopId: dto.shopId, email },
    });

    if (!customer) {
      customer = this.customersRepository.create({
        shopId: dto.shopId,
        email,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, this.authConfig.bcryptRounds);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    customer.otpHash = otpHash;
    customer.otpExpiry = otpExpiry;
    await this.customersRepository.save(customer);

    this.resetOtpAttempts(key, otpExpiry);

    await this.notificationsService.sendOtpEmail(email, otp, shop.name);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[OTP] ${email} -> ${otp}`);
    }

    return { message: 'OTP sent successfully', expiresIn: 600 };
  }

  async verifyCustomerOtp(dto: VerifyOtpDto) {
    const email = this.normalizeEmail(dto.email);
    const customer = await this.customersRepository.findOne({
      where: { shopId: dto.shopId, email },
    });

    if (!customer || !customer.otpHash || !customer.otpExpiry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const key = this.otpKey(dto.shopId, email);
    if (this.hasExceededOtpAttempts(key)) {
      throw new UnauthorizedException('OTP attempts exceeded');
    }

    if (customer.otpExpiry.getTime() < Date.now()) {
      customer.otpHash = null;
      customer.otpExpiry = null;
      await this.customersRepository.save(customer);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const isValid = await bcrypt.compare(dto.otp, customer.otpHash);
    if (!isValid) {
      this.registerOtpFailure(key);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    customer.otpHash = null;
    customer.otpExpiry = null;
    await this.customersRepository.save(customer);
    this.otpAttempts.delete(key);

    const accessToken = await this.issueAccessToken({
      sub: customer.id,
      type: 'customer',
      shopId: customer.shopId,
    });

    const refreshToken = await this.issueRefreshToken({
      sub: customer.id,
      type: 'refresh',
      subjectType: 'customer',
    });

    await this.refreshTokensRepository.save({
      customerId: customer.id,
      token: refreshToken,
      expiresAt: this.buildExpiryDate(this.authConfig.refreshTokenExpiresIn),
    });

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  async validateAdminCredentials(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: this.normalizeEmail(email) },
      relations: ['role'],
    });
    if (!user) {
      return null;
    }
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return null;
    }
    this.assertPasswordStrength(password);
    return user;
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.validateAdminCredentials(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.is2FAEnabled) {
      const tempToken = await this.issueTempToken({
        sub: user.id,
        type: '2fa',
      });
      return { requires2FA: true, tempToken };
    }

    return this.issueUserTokens(user);
  }

  async verify2fa(dto: Verify2faDto) {
    let payload: { sub: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.tempToken, {
        secret: this.authConfig.tempTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.type !== '2fa') {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.totpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid code');
    }

    return this.issueUserTokens(user);
  }

  async setup2fa(currentUser: { id: string }) {
    const user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'Beautivo', secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    user.totpSecret = secret;
    await this.usersRepository.save(user);

    return { secret, qrCode };
  }

  async confirm2fa(currentUser: { id: string }, dto: Confirm2faDto) {
    const user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user || !user.totpSecret) {
      throw new BadRequestException('2FA setup not started');
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.totpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid code');
    }

    user.is2FAEnabled = true;
    await this.usersRepository.save(user);

    return { message: '2FA enabled successfully' };
  }

  async disable2fa(currentUser: { id: string }, dto: Disable2faDto) {
    const user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user || !user.totpSecret) {
      throw new BadRequestException('2FA not configured');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const codeValid = authenticator.verify({
      token: dto.code,
      secret: user.totpSecret,
    });
    if (!codeValid) {
      throw new UnauthorizedException('Invalid code');
    }

    user.is2FAEnabled = false;
    user.totpSecret = null;
    await this.usersRepository.save(user);

    return { message: '2FA disabled successfully' };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; type: string; subjectType?: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.authConfig.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshTokensRepository.findOne({
      where: { token: dto.refreshToken },
    });

    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.refreshTokensRepository.delete({ token: dto.refreshToken });

    if (payload.subjectType === 'customer' || stored.customerId) {
      const customer = await this.customersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!customer) {
        throw new UnauthorizedException('Customer not found');
      }

      const accessToken = await this.issueAccessToken({
        sub: customer.id,
        type: 'customer',
        shopId: customer.shopId,
      });

      const refreshToken = await this.issueRefreshToken({
        sub: customer.id,
        type: 'refresh',
        subjectType: 'customer',
      });

      await this.refreshTokensRepository.save({
        customerId: customer.id,
        token: refreshToken,
        expiresAt: this.buildExpiryDate(this.authConfig.refreshTokenExpiresIn),
      });

      return { accessToken, refreshToken };
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.issueUserTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(dto: LogoutDto) {
    await this.refreshTokensRepository.delete({ token: dto.refreshToken });
    return { message: 'Logged out successfully' };
  }

  private async issueUserTokens(user: User) {
    const role = user.roleId
      ? await this.rolesRepository.findOne({ where: { id: user.roleId } })
      : null;

    const accessToken = await this.issueAccessToken({
      sub: user.id,
      type: 'user',
      shopId: user.shopId,
      roleId: user.roleId,
      roleName: role?.name ?? user.role?.name ?? null,
      permissions: role?.permissions ?? user.role?.permissions ?? [],
    });

    const refreshToken = await this.issueRefreshToken({
      sub: user.id,
      type: 'refresh',
      subjectType: 'user',
    });

    await this.refreshTokensRepository.save({
      userId: user.id,
      token: refreshToken,
      expiresAt: this.buildExpiryDate(this.authConfig.refreshTokenExpiresIn),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          id: role?.id ?? user.roleId,
          name: role?.name ?? user.role?.name,
        },
      },
    };
  }
}

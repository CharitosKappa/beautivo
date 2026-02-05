import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { Confirm2faDto } from './dto/confirm-2fa.dto';
import { Disable2faDto } from './dto/disable-2fa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('customer/request-otp')
  @Throttle({ limit: 3, ttl: 60 })
  requestCustomerOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestCustomerOtp(dto);
  }

  @Public()
  @Post('customer/verify-otp')
  @Throttle({ limit: 10, ttl: 60 })
  verifyCustomerOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyCustomerOtp(dto);
  }

  @Public()
  @Post('admin/login')
  @Throttle({ limit: 10, ttl: 60 })
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Public()
  @Post('admin/verify-2fa')
  @Throttle({ limit: 10, ttl: 60 })
  verify2fa(@Body() dto: Verify2faDto) {
    return this.authService.verify2fa(dto);
  }

  @Post('admin/setup-2fa')
  setup2fa(@CurrentUser() user: { id: string }) {
    return this.authService.setup2fa(user);
  }

  @Post('admin/confirm-2fa')
  confirm2fa(
    @CurrentUser() user: { id: string },
    @Body() dto: Confirm2faDto,
  ) {
    return this.authService.confirm2fa(user, dto);
  }

  @Post('admin/disable-2fa')
  disable2fa(
    @CurrentUser() user: { id: string },
    @Body() dto: Disable2faDto,
  ) {
    return this.authService.disable2fa(user, dto);
  }

  @Public()
  @Post('refresh')
  @Throttle({ limit: 10, ttl: 60 })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto);
  }
}

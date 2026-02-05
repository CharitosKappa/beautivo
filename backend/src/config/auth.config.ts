import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  tempTokenSecret: process.env.JWT_TEMP_SECRET ?? 'dev-temp-secret',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  tempTokenExpiresIn: process.env.JWT_TEMP_EXPIRES_IN ?? '5m',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
}));

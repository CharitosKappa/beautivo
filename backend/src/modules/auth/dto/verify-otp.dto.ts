import { IsEmail, IsString, IsUUID, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsUUID()
  shopId: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

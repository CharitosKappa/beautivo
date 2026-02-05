import { IsEmail, IsString, IsUUID } from 'class-validator';

export class RequestOtpDto {
  @IsUUID()
  shopId: string;

  @IsEmail()
  email: string;
}

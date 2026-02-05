import { IsString, Length } from 'class-validator';

export class Disable2faDto {
  @IsString()
  @Length(6, 6)
  code: string;

  @IsString()
  password: string;
}

import { IsEmail, IsOptional, IsString } from 'class-validator';
import { User } from 'src/users/user.schema';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class LoginDataDto {
  @IsOptional()
  data?: User;

  @IsOptional()
  @IsString()
  access_token?: string;
}

export class UserLoginResponseDto {
  access_token: string;
  user: User;
}

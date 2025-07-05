import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

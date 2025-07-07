import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  STRONG_PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from 'src/lib/constants';

export class RegisterDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: 'Username must be at least 4 characters long',
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: 'Username must be at most 32 characters long',
  })
  @Matches(USERNAME_REGEX, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: 'Password must be at most 128 characters long',
  })
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'Password must include at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password: string;
}

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

export class RefreshTokenDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MinLength(32, { message: 'Refresh token is too short' })
  @MaxLength(512, { message: 'Refresh token is too long' })
  refreshToken: string;
}

import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from 'src/lib/constants';

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty({ message: 'Username should not be empty if provided' })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: 'Username must be at least 4 characters long',
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: 'Username must be at most 32 characters long',
  })
  @Matches(USERNAME_REGEX, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;
}

// src/users/dto/update-user.dto.ts
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional() // username là optional vì người dùng có thể không muốn cập nhật nó
  @IsNotEmpty({ message: 'Username should not be empty if provided' })
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  username?: string;

  // Các trường khác như email, age, nickname sẽ không được thêm vào đây
  // theo yêu cầu chỉ update username
}

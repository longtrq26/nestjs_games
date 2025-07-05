// src/line98/dto/line98.dto.ts
import {
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { TOTAL_CELLS } from '../constants';

export class CreateLine98GameDto {
  // Không cần gì ở đây, vì userId sẽ được lấy từ JWT
}

export class MoveBallDto {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;

  @IsNumber()
  @Min(0)
  @Max(TOTAL_CELLS - 1)
  from: number; // Vị trí hiện tại của bóng

  @IsNumber()
  @Min(0)
  @Max(TOTAL_CELLS - 1)
  to: number; // Vị trí đích của bóng
}

export class GetHintDto {
  @IsUUID()
  @IsNotEmpty()
  gameId: string;
}

export interface Line98GameStatePayload {
  gameId: string;
  boardState: string[]; // Mảng các ký tự màu bóng/trống
  nextBalls: string[]; // Mảng 3 ký tự màu bóng tiếp theo
  score: number;
  status: 'IN_PROGRESS' | 'FINISHED';
}

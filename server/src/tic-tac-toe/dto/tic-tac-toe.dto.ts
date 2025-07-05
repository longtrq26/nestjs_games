// src/tic-tac-toe/dto/tic-tac-toe.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TicTacToePlayerSymbol, TicTacToeGameStatus } from '@prisma/client';

// Interfaces cho các sự kiện gửi đi từ server
export interface GameStatePayload {
  gameId: string;
  board: string[]; // Mảng 9 phần tử, ví dụ: ['X', '-', 'O', ...]
  currentPlayerSymbol: TicTacToePlayerSymbol | null;
  status: TicTacToeGameStatus;
  player1Id: string;
  player2Id: string | null;
  player1Symbol: TicTacToePlayerSymbol | null; // X or O for player1
  player2Symbol: TicTacToePlayerSymbol | null; // X or O for player2
  winnerSymbol: TicTacToePlayerSymbol | null;
}

export interface PlayerJoinedPayload {
  gameId: string;
  player1Id: string;
  player2Id: string;
  player1Username: string; // Tên của người chơi 1
  player2Username: string; // Tên của người chơi 2
  player1Symbol: TicTacToePlayerSymbol; // Ký hiệu của người chơi 1
  player2Symbol: TicTacToePlayerSymbol; // Ký hiệu của người chơi 2
}

export interface GameOutcomePayload {
  gameId: string;
  status: TicTacToeGameStatus;
  winnerSymbol: TicTacToePlayerSymbol | null;
  board: string[];
}

// DTO cho các sự kiện nhận từ client (Validation)
export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  gameId: string;
}

export class MakeMoveDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  gameId: string;

  @IsNumber()
  @Min(0)
  @Max(8)
  position: number;
}

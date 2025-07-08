import { TicTacToeGameStatus, TicTacToePlayerSymbol } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export interface GameStatePayload {
  gameId: string;
  board: string[];
  currentPlayerSymbol: TicTacToePlayerSymbol | null;
  status: TicTacToeGameStatus;
  player1Id: string;
  player2Id: string | null;
  player1Symbol: TicTacToePlayerSymbol | null;
  player2Symbol: TicTacToePlayerSymbol | null;
  winnerSymbol: TicTacToePlayerSymbol | null;
}

export interface PlayerJoinedPayload {
  gameId: string;
  player1Id: string;
  player2Id: string;
  player1Username: string;
  player2Username: string;
  player1Symbol: TicTacToePlayerSymbol;
  player2Symbol: TicTacToePlayerSymbol;
}

export interface GameOutcomePayload {
  gameId: string;
  status: TicTacToeGameStatus;
  winnerSymbol: TicTacToePlayerSymbol | null;
  board: string[];
}

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

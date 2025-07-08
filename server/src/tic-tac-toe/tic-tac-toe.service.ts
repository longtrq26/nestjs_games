import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Prisma,
  TicTacToeGame,
  TicTacToeGameStatus,
  TicTacToePlayerSymbol,
} from '@prisma/client';
import { BOARD_SIZE, WINNING_COMBINATIONS } from 'src/lib/constants';
import { GameWithPlayers } from 'src/lib/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameStatePayload, PlayerJoinedPayload } from './dto/tic-tac-toe.dto';

@Injectable()
export class TicTacToeService {
  constructor(private prisma: PrismaService) {}

  async createGame(player1Id: string): Promise<TicTacToeGame> {
    const existingWaitingGame = await this.prisma.ticTacToeGame.findFirst({
      where: {
        player1Id: player1Id,
        status: TicTacToeGameStatus.WAITING_FOR_PLAYER,
      },
    });

    if (existingWaitingGame) {
      return existingWaitingGame;
    }

    const initialBoard = '-'.repeat(BOARD_SIZE);

    const newGame = await this.prisma.ticTacToeGame.create({
      data: {
        player1Id: player1Id,
        boardState: initialBoard,
        status: TicTacToeGameStatus.WAITING_FOR_PLAYER,
        player1Symbol: TicTacToePlayerSymbol.X,
        player2Symbol: TicTacToePlayerSymbol.O,
      },
      include: {
        player1: {
          select: { username: true },
        },
      },
    });

    return newGame;
  }

  async findWaitingGame(): Promise<Prisma.TicTacToeGameGetPayload<{
    include: { player1: { select: { username: true } } };
  }> | null> {
    return this.prisma.ticTacToeGame.findFirst({
      where: { status: TicTacToeGameStatus.WAITING_FOR_PLAYER },
      include: {
        player1: { select: { username: true } },
      },
    });
  }

  async joinGame(
    gameId: string,
    player2Id: string,
  ): Promise<{
    game: GameWithPlayers;
    playerJoinedPayload: PlayerJoinedPayload;
  }> {
    const game = await this.prisma.ticTacToeGame.findUnique({
      where: { id: gameId },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    if (game.status !== TicTacToeGameStatus.WAITING_FOR_PLAYER) {
      throw new BadRequestException('This game is not waiting for a player.');
    }

    if (game.player1Id === player2Id) {
      throw new BadRequestException(
        'You cannot join your own game as a second player.',
      );
    }

    const player1Symbol =
      Math.random() < 0.5 ? TicTacToePlayerSymbol.X : TicTacToePlayerSymbol.O;
    const player2Symbol =
      player1Symbol === TicTacToePlayerSymbol.X
        ? TicTacToePlayerSymbol.O
        : TicTacToePlayerSymbol.X;
    const currentPlayerSymbol = TicTacToePlayerSymbol.X;

    const updatedGame = await this.prisma.ticTacToeGame.update({
      where: { id: gameId },
      data: {
        player2Id,
        status: TicTacToeGameStatus.IN_PROGRESS,
        currentPlayerSymbol,
        player1Symbol,
        player2Symbol,
      },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });

    if (!updatedGame.player2 || !updatedGame.player2.username) {
      throw new Error('Player 2 information is missing after update.');
    }

    const playerJoinedPayload: PlayerJoinedPayload = {
      gameId: updatedGame.id,
      player1Id: updatedGame.player1Id,
      player2Id: updatedGame.player2Id!,
      player1Username: updatedGame.player1.username,
      player2Username: updatedGame.player2.username,
      player1Symbol,
      player2Symbol,
    };

    return { game: updatedGame, playerJoinedPayload };
  }

  async getGameState(gameId: string): Promise<GameStatePayload> {
    const game = await this.prisma.ticTacToeGame.findUnique({
      where: { id: gameId },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    return {
      gameId: game.id,
      board: game.boardState.split(''),
      currentPlayerSymbol: game.currentPlayerSymbol,
      status: game.status,
      player1Id: game.player1Id,
      player2Id: game.player2Id,
      player1Symbol: game.player1Symbol,
      player2Symbol: game.player2Symbol,
      winnerSymbol: game.winnerSymbol,
    };
  }

  async makeMove(
    gameId: string,
    userId: string,
    position: number,
  ): Promise<{
    updatedGame: TicTacToeGame;
    gameStatePayload: GameStatePayload;
  }> {
    const game = await this.prisma.ticTacToeGame.findUnique({
      where: { id: gameId },
      include: {
        player1: true,
        player2: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    if (game.status !== TicTacToeGameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game is not in progress.');
    }

    if (game.currentPlayerSymbol === null) {
      throw new BadRequestException('Current player symbol is not set.');
    }

    let playerSymbol: TicTacToePlayerSymbol;
    if (game.player1Id === userId) {
      playerSymbol = game.currentPlayerSymbol;
    } else if (game.player2Id === userId) {
      playerSymbol = game.currentPlayerSymbol;
    } else {
      throw new BadRequestException('You are not a player in this game.');
    }

    const playerSymbolToMove = game.currentPlayerSymbol;
    if (playerSymbol !== playerSymbolToMove) {
      throw new BadRequestException(
        `It's not your turn. Current turn: ${playerSymbolToMove}`,
      );
    }

    let board = game.boardState.split('');

    if (board[position] !== '-') {
      throw new BadRequestException('Position already taken.');
    }

    board[position] = playerSymbol; // Thực hiện nước đi

    // Lưu nước đi vào DB
    await this.prisma.ticTacToeMove.create({
      data: {
        gameId: game.id,
        userId: userId,
        playerSymbol: playerSymbol,
        position: position,
      },
    });

    // Cập nhật trạng thái game và xác định kết quả
    let newStatus: TicTacToeGameStatus = TicTacToeGameStatus.IN_PROGRESS;
    let winnerSymbol: TicTacToePlayerSymbol | null = null;

    if (this.checkWin(board, playerSymbol)) {
      newStatus = TicTacToeGameStatus.FINISHED;
      winnerSymbol = playerSymbol;
    } else if (this.checkDraw(board)) {
      newStatus = TicTacToeGameStatus.FINISHED;
      winnerSymbol = null; // Hòa
    }

    // Chuyển lượt
    const nextPlayerSymbol =
      playerSymbol === TicTacToePlayerSymbol.X
        ? TicTacToePlayerSymbol.O
        : TicTacToePlayerSymbol.X;
    const updatedGame = await this.prisma.ticTacToeGame.update({
      where: { id: gameId },
      data: {
        boardState: board.join(''),
        status: newStatus,
        winnerSymbol: winnerSymbol,
        currentPlayerSymbol:
          newStatus === TicTacToeGameStatus.IN_PROGRESS
            ? nextPlayerSymbol
            : null, // Set null nếu game kết thúc
      },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });

    const player1Symbol = updatedGame.player1Symbol;
    const player2Symbol = updatedGame.player2Symbol;

    const gameStatePayload: GameStatePayload = {
      gameId: updatedGame.id,
      board: updatedGame.boardState.split(''),
      currentPlayerSymbol: updatedGame.currentPlayerSymbol,
      status: updatedGame.status,
      player1Id: updatedGame.player1Id,
      player2Id: updatedGame.player2Id,
      player1Symbol: player1Symbol, // Cần xác định lại ký hiệu thực tế của người chơi trên bàn cờ
      player2Symbol: player2Symbol,
      winnerSymbol: updatedGame.winnerSymbol,
    };

    return { updatedGame, gameStatePayload };
  }

  async abortGame(gameId: string, userId: string): Promise<TicTacToeGame> {
    const game = await this.prisma.ticTacToeGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    if (game.player1Id !== userId && game.player2Id !== userId) {
      throw new UnauthorizedException('You are not a player in this game.');
    }

    const abortedGame = await this.prisma.ticTacToeGame.update({
      where: { id: gameId },
      data: {
        status: TicTacToeGameStatus.ABORTED,
        currentPlayerSymbol: null,
      },
    });

    return abortedGame;
  }

  private checkWin(board: string[], player: TicTacToePlayerSymbol): boolean {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] === player && board[b] === player && board[c] === player) {
        return true;
      }
    }
    return false;
  }

  private checkDraw(board: string[]): boolean {
    return board.every((cell) => cell !== '-');
  }
}

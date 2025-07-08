import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { TicTacToeGameStatus, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';
import { GameWithPlayers } from 'src/lib/types';
import {
  GameOutcomePayload,
  JoinGameDto,
  MakeMoveDto,
  PlayerJoinedPayload,
} from './dto/tic-tac-toe.dto';
import { SocketToGameService } from './socket-to-game.service';
import { TicTacToeService } from './tic-tac-toe.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/tic-tac-toe',
})
export class TicTacToeGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly ticTacToeService: TicTacToeService,
    private readonly socketToGameService: SocketToGameService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const gameId = this.socketToGameService.get(client.id);
    const user = client.data.user as User;

    if (gameId && user?.id) {
      try {
        await this.ticTacToeService.abortGame(gameId, user.id);
        this.server.to(gameId).emit('gameAborted', { gameId });
      } catch (error) {
        console.error(`Failed to abort game ${gameId} on disconnect:`, error);
      } finally {
        this.socketToGameService.delete(client.id);
      }
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('createGame')
  async createGame(@ConnectedSocket() client: Socket) {
    const user = client.data.user as User;

    const game = await this.ticTacToeService.createGame(user.id);
    client.join(game.id);

    this.socketToGameService.set(client.id, game.id);

    const gameState = await this.ticTacToeService.getGameState(game.id);

    client.emit('gameCreated', gameState);

    return {
      event: 'gameCreated',
      data: gameState,
    };
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('findWaitingGame')
  async findWaitingGame(@ConnectedSocket() client: Socket) {
    const game = await this.ticTacToeService.findWaitingGame();
    if (game) {
      client.emit('waitingGameFound', {
        gameId: game.id,
        player1Id: game.player1Id,
        player1Username: game.player1.username,
      });
    } else {
      client.emit('noWaitingGame');
      console.log(`User ${client.data.user.username} found no waiting game`);
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('joinGame')
  async joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGameDto,
  ) {
    const user = client.data.user as User;

    try {
      const {
        game,
        playerJoinedPayload,
      }: { game: GameWithPlayers; playerJoinedPayload: PlayerJoinedPayload } =
        await this.ticTacToeService.joinGame(data.gameId, user.id);

      client.join(game.id);

      this.socketToGameService.set(client.id, game.id);

      const gameState = await this.ticTacToeService.getGameState(game.id);

      this.server.to(game.id).emit('playerJoined', {
        gameId: gameState.gameId,
        boardState: gameState.board.join(''),
        currentPlayer: gameState.currentPlayerSymbol,
        status: gameState.status,

        playerXId:
          gameState.player1Symbol === 'X'
            ? gameState.player1Id
            : gameState.player2Id,
        playerOId:
          gameState.player1Symbol === 'O'
            ? gameState.player1Id
            : gameState.player2Id,
        playerXUsername:
          gameState.player1Symbol === 'X'
            ? playerJoinedPayload.player1Username
            : playerJoinedPayload.player2Username,
        playerOUsername:
          gameState.player1Symbol === 'O'
            ? playerJoinedPayload.player1Username
            : playerJoinedPayload.player2Username,
      });

      this.server.to(game.id).emit('gameState', gameState);

      return {
        event: 'gameJoined',
        data: { gameId: game.id, player2Id: user.id },
      };
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to join game.',
      });
      console.error(
        `User ${user.username} failed to join game ${data.gameId}: ${error.message}`,
      );
      return {
        event: 'error',
        data: { message: error.message || 'Failed to join game.' },
      };
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('makeMove')
  async makeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MakeMoveDto,
  ) {
    const user = client.data.user as User;
    try {
      const { updatedGame, gameStatePayload } =
        await this.ticTacToeService.makeMove(
          data.gameId,
          user.id,
          data.position,
        );

      this.server.to(updatedGame.id).emit('gameState', gameStatePayload);

      if (updatedGame.status === TicTacToeGameStatus.FINISHED) {
        const gameOutcomePayload: GameOutcomePayload = {
          gameId: updatedGame.id,
          status: updatedGame.status,
          winnerSymbol: updatedGame.winnerSymbol,
          board: updatedGame.boardState.split(''),
        };
        this.server.to(updatedGame.id).emit('gameFinished', gameOutcomePayload);
      }

      return {
        event: 'moveMade',
        data: {
          gameId: updatedGame.id,
          userId: user.id,
          position: data.position,
        },
      };
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to make move.',
      });
      console.error(
        `User ${user.username} failed to make move in game ${data.gameId}: ${error.message}`,
      );
      return {
        event: 'error',
        data: { message: error.message || 'Failed to make move.' },
      };
    }
  }
}

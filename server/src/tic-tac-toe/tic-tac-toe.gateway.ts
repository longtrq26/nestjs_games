import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TicTacToeService } from './tic-tac-toe.service';
import { UseGuards } from '@nestjs/common';
import { TicTacToeGameStatus, User, Prisma } from '@prisma/client';
import {
  GameOutcomePayload,
  JoinGameDto,
  MakeMoveDto,
  PlayerJoinedPayload,
} from './dto/tic-tac-toe.dto';
import { JwtWsAuthGuard } from 'src/auth/guards/jwt-ws-auth.guard';

type GameWithPlayers = Prisma.TicTacToeGameGetPayload<{
  include: {
    player1: { select: { username: true } };
    player2: { select: { username: true } };
  };
}>;

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép mọi origin, bạn nên giới hạn trong môi trường production
    credentials: true,
  },
  namespace: '/tic-tac-toe', // Namespace riêng cho Tic Tac Toe
})
export class TicTacToeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly ticTacToeService: TicTacToeService) {}

  async handleConnection(client: Socket) {
    // Để xác thực JWT qua WebSocket, client cần gửi token trong handshake query hoặc header.
    // Chúng ta sẽ xử lý việc xác thực này trong JwtWsAuthGuard.
    console.log(`Client connected: ${client.id}`);
  }

  // Xử lý khi client ngắt kết nối
  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // TODO: Xử lý trường hợp người chơi rời game giữa chừng, đánh dấu game ABORTED
    // Bạn có thể tìm game mà người chơi này đang tham gia và cập nhật trạng thái.
    // Điều này sẽ phức tạp hơn và có thể cần một map tạm thời client.id -> game.id hoặc query database.
    // Để MVP, chúng ta sẽ bỏ qua logic này.
  }

  @UseGuards(JwtWsAuthGuard) // Bảo vệ sự kiện này bằng JWT Guard
  @SubscribeMessage('createGame')
  async createGame(@ConnectedSocket() client: Socket) {
    const user = client.data.user as User; // User object từ JWT Guard
    console.log('[SERVER] Received createGame from', user?.username);

    const game = await this.ticTacToeService.createGame(user.id);
    client.join(game.id); // Cho client vào phòng của game này

    const gameState = await this.ticTacToeService.getGameState(game.id);

    client.emit('gameCreated', gameState);

    console.log(`User ${user.username} created game ${game.id}`);
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
      console.log(
        `User ${client.data.user.username} found waiting game ${game.id}`,
      );
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
      console.log(`User ${user.username} joined game ${game.id}`);

      // ✅ Lấy gameState đầy đủ từ service
      const gameState = await this.ticTacToeService.getGameState(game.id);

      // ✅ Emit playerJoined dùng gameState trực tiếp
      this.server.to(game.id).emit('playerJoined', {
        gameId: gameState.gameId,
        boardState: gameState.board.join(''), // convert string[] -> string
        currentPlayer: gameState.currentPlayerSymbol, // dùng đúng tên key
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

      // 🆗 (Optional) Emit gameState nếu bạn cần client sync toàn bộ
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

      // Gửi trạng thái game mới nhất cho tất cả client trong phòng game này
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
      console.log(
        `User ${user.username} made move in game ${data.gameId} at position ${data.position}`,
      );
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

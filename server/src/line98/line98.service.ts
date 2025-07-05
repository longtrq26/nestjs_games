import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Line98Game, Line98GameStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BALL_COLORS,
  BOARD_SIZE,
  INITIAL_BALLS,
  MIN_LINE_TO_CLEAR,
  NEW_BALLS_PER_TURN,
  TOTAL_CELLS,
} from './constants';
import { Line98GameStatePayload } from './dto/line98.dto';
import { BoardCell, GameBoard, HintMove, Path } from './types';

@Injectable()
export class Line98Service {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: string): Promise<Line98Game> {
    const initialBoard = Array(TOTAL_CELLS).fill('-');
    this.placeRandomBalls(initialBoard, INITIAL_BALLS); // Đặt bóng ban đầu

    const newNextBalls = this.generateRandomBalls(NEW_BALLS_PER_TURN); // Tạo bóng tiếp theo

    const newGame = await this.prisma.line98Game.create({
      data: {
        userId: userId,
        boardState: initialBoard.join(''),
        nextBalls: newNextBalls.join(''),
        status: Line98GameStatus.IN_PROGRESS,
        score: 0,
      },
    });
    return newGame;
  }

  async getGameState(gameId: string): Promise<Line98GameStatePayload> {
    const game = await this.prisma.line98Game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    return {
      gameId: game.id,
      boardState: game.boardState.split(''),
      nextBalls: game.nextBalls.split(''),
      score: game.score,
      status: game.status,
    };
  }

  async moveBall(
    gameId: string,
    userId: string,
    from: number,
    to: number,
  ): Promise<Line98GameStatePayload> {
    const game = await this.prisma.line98Game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }
    if (game.userId !== userId) {
      throw new BadRequestException('You are not the player of this game.');
    }
    if (game.status === Line98GameStatus.FINISHED) {
      throw new BadRequestException('Game is already finished.');
    }

    let board: GameBoard = game.boardState.split('');
    const ballColor = board[from];

    if (ballColor === '-') {
      throw new BadRequestException('No ball at starting position.');
    }
    if (board[to] !== '-') {
      throw new BadRequestException('Destination position is not empty.');
    }

    // 1. Tìm đường đi ngắn nhất
    const path = this.findPath(board, from, to);
    if (!path) {
      throw new BadRequestException('No valid path found to destination.');
    }

    // 2. Thực hiện di chuyển trên bàn cờ
    board[to] = ballColor;
    board[from] = '-';

    let currentScore = game.score;
    let clearedBallsCount = 0;

    // 3. Kiểm tra và loại bỏ các đường thẳng
    const { clearedBoard, clearedCount } = this.clearLines(board);
    board = clearedBoard;
    clearedBallsCount = clearedCount;

    if (clearedBallsCount > 0) {
      currentScore += clearedBallsCount; // Tăng điểm
      // Nếu có bóng nổ, không sinh bóng mới
    } else {
      // 4. Sinh bóng mới nếu không có bóng nào được nổ
      const nextBallsColors = game.nextBalls.split('');
      const emptyCells = this.getEmptyCells(board);

      if (emptyCells.length < nextBallsColors.length) {
        // Hết ô trống, game over
        await this.prisma.line98Game.update({
          where: { id: gameId },
          data: {
            status: Line98GameStatus.FINISHED,
            boardState: board.join(''),
            score: currentScore,
          },
        });
        throw new BadRequestException('No more empty cells. Game Over!');
      }

      this.placeSpecificBalls(board, nextBallsColors);
      const { clearedBoard: newClearedBoard, clearedCount: newClearedCount } =
        this.clearLines(board);
      board = newClearedBoard;
      currentScore += newClearedCount;

      // Sinh 3 bóng tiếp theo cho lượt sau
      game.nextBalls = this.generateRandomBalls(NEW_BALLS_PER_TURN).join('');
    }

    // 5. Kiểm tra Game Over (sau khi sinh bóng và dọn dẹp)
    if (
      this.getEmptyCells(board).length === 0 &&
      this.clearLines(board).clearedCount === 0
    ) {
      game.status = Line98GameStatus.FINISHED;
      throw new BadRequestException(
        'Board is full and no lines can be cleared. Game Over!',
      );
    }

    // 6. Cập nhật trạng thái game vào DB
    const updatedGame = await this.prisma.line98Game.update({
      where: { id: gameId },
      data: {
        boardState: board.join(''),
        nextBalls: game.nextBalls,
        score: currentScore,
        status: game.status,
      },
    });

    return {
      gameId: updatedGame.id,
      boardState: updatedGame.boardState.split(''),
      nextBalls: updatedGame.nextBalls.split(''),
      score: updatedGame.score,
      status: updatedGame.status,
    };
  }

  async getHint(gameId: string, userId: string): Promise<HintMove | null> {
    const game = await this.prisma.line98Game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }
    if (game.userId !== userId) {
      throw new BadRequestException('You are not the player of this game.');
    }
    if (game.status === Line98GameStatus.FINISHED) {
      return null; // Không có gợi ý nếu game đã kết thúc
    }

    const board: GameBoard = game.boardState.split('');
    const nextBalls = game.nextBalls.split('');
    const currentScore = game.score;

    const possibleMoves: HintMove[] = [];

    for (let from = 0; from < TOTAL_CELLS; from++) {
      if (board[from] === '-') continue; // Không có bóng để di chuyển

      for (let to = 0; to < TOTAL_CELLS; to++) {
        if (board[to] !== '-') continue; // Vị trí đích phải trống

        const path = this.findPath(board, from, to);
        if (!path) continue; // Không có đường đi hợp lệ

        // Giả lập di chuyển để kiểm tra
        const tempBoard = [...board];
        tempBoard[to] = tempBoard[from];
        tempBoard[from] = '-';

        // 1. Ưu tiên: Nổ một dãy ngay lập tức (loại 'clear')
        const { clearedCount } = this.clearLines(tempBoard);
        if (clearedCount >= MIN_LINE_TO_CLEAR) {
          possibleMoves.push({
            from,
            to,
            score: clearedCount * 100,
            type: 'clear',
          }); // Điểm cao cho nổ
        } else {
          // 2. Ưu tiên thứ hai: Có cơ hội tạo thành một dãy (loại 'potential_line')
          // Kiểm tra xem sau khi di chuyển, và sau khi sinh bóng mới, có thể tạo thành một đường không.
          // Đây là phần rất phức tạp của AI, đòi hỏi tìm kiếm sâu.
          // Để đơn giản hóa cho MVP, chúng ta sẽ chỉ kiểm tra xem di chuyển này có mở ra không gian cho các nước đi tương lai không.
          // Một cách đơn giản là kiểm tra nếu nó tạo ra một đường gần đầy đủ (4 bóng)
          const potentialBoard = [...tempBoard];
          // Giả lập sinh bóng tiếp theo
          const emptyCellsAfterMove = this.getEmptyCells(potentialBoard);
          if (emptyCellsAfterMove.length >= nextBalls.length) {
            const tempBoardAfterNextBalls = [...potentialBoard];
            const randomEmptyCells = this.getRandomEmptyCells(
              tempBoardAfterNextBalls,
              nextBalls.length,
            );
            for (let i = 0; i < nextBalls.length; i++) {
              tempBoardAfterNextBalls[randomEmptyCells[i]] = nextBalls[i];
            }

            const potentialLines = this.findPotentialLines(
              tempBoardAfterNextBalls,
            );
            if (potentialLines > 0) {
              possibleMoves.push({
                from,
                to,
                score: potentialLines * 10,
                type: 'potential_line',
              }); // Điểm trung bình
            } else {
              // 3. Ưu tiên thứ ba: Chỉ có thể di chuyển (loại 'movable')
              possibleMoves.push({ from, to, score: 1, type: 'movable' }); // Điểm thấp
            }
          } else {
            possibleMoves.push({ from, to, score: 1, type: 'movable' }); // Vẫn là movable nếu không đủ chỗ cho bóng mới
          }
        }
      }
    }

    // Sắp xếp gợi ý theo điểm số giảm dần
    possibleMoves.sort((a, b) => b.score - a.score);

    return possibleMoves.length > 0 ? possibleMoves[0] : null;
  }

  private generateRandomBalls(count: number): BoardCell[] {
    const balls: BoardCell[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * BALL_COLORS.length);
      balls.push(BALL_COLORS[randomIndex]);
    }
    return balls;
  }

  private placeRandomBalls(board: GameBoard, count: number): void {
    const emptyCells = this.getEmptyCells(board);
    const ballsToPlace = this.generateRandomBalls(count);

    for (let i = 0; i < ballsToPlace.length; i++) {
      if (emptyCells.length === 0) break;
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const position = emptyCells.splice(randomIndex, 1)[0];
      board[position] = ballsToPlace[i];
    }
  }

  private placeSpecificBalls(board: GameBoard, balls: BoardCell[]): void {
    const emptyCells = this.getEmptyCells(board);

    if (emptyCells.length < balls.length) {
      // Xử lý game over nếu không đủ chỗ cho các bóng mới
      // Điều này sẽ được xử lý lại ở hàm moveBall
      console.warn('Not enough empty cells for new balls. Game might be over.');
      return;
    }

    for (let i = 0; i < balls.length; i++) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const position = emptyCells.splice(randomIndex, 1)[0];
      board[position] = balls[i];
    }
  }

  private getEmptyCells(board: GameBoard): number[] {
    const emptyCells: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (board[i] === '-') {
        emptyCells.push(i);
      }
    }
    return emptyCells;
  }

  private getRandomEmptyCells(board: GameBoard, count: number): number[] {
    const emptyCells = this.getEmptyCells(board);
    const shuffled = emptyCells.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private findPath(
    board: GameBoard,
    startIdx: number,
    endIdx: number,
  ): Path | null {
    if (startIdx === endIdx) return [startIdx]; // Đích là chính nó

    const queue: { idx: number; path: Path }[] = [
      { idx: startIdx, path: [startIdx] },
    ];
    const visited = new Set<number>();
    visited.add(startIdx);

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;

      const { idx: currentIdx, path: currentPath } = item;

      // Duyệt qua các ô lân cận (trên, dưới, trái, phải)
      const neighbors = this.getNeighbors(currentIdx);

      for (const neighborIdx of neighbors) {
        if (!visited.has(neighborIdx) && board[neighborIdx] === '-') {
          visited.add(neighborIdx);
          const newPath = [...currentPath, neighborIdx];

          if (neighborIdx === endIdx) {
            return newPath; // Tìm thấy đường đi
          }
          queue.push({ idx: neighborIdx, path: newPath });
        }
      }
    }
    return null; // Không tìm thấy đường đi
  }

  private getNeighbors(idx: number): number[] {
    const neighbors: number[] = [];
    const row = Math.floor(idx / BOARD_SIZE);
    const col = idx % BOARD_SIZE;

    // Trên
    if (row > 0) neighbors.push(idx - BOARD_SIZE);
    // Dưới
    if (row < BOARD_SIZE - 1) neighbors.push(idx + BOARD_SIZE);
    // Trái
    if (col > 0) neighbors.push(idx - 1);
    // Phải
    if (col < BOARD_SIZE - 1) neighbors.push(idx + 1);

    return neighbors;
  }

  private clearLines(board: GameBoard): {
    clearedBoard: GameBoard;
    clearedCount: number;
  } {
    let currentBoard = [...board];
    let totalClearedCount = 0;
    let ballsToClear: Set<number> = new Set();

    // Duyệt qua từng ô để tìm các đường
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const color = currentBoard[i];
      if (color === '-') continue;

      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;

      // Kiểm tra ngang
      this.checkAndAddLine(
        currentBoard,
        i,
        color,
        row,
        col,
        0,
        1,
        ballsToClear,
      ); // Ngang
      // Kiểm tra dọc
      this.checkAndAddLine(
        currentBoard,
        i,
        color,
        row,
        col,
        1,
        0,
        ballsToClear,
      ); // Dọc
      // Kiểm tra chéo phải-xuống
      this.checkAndAddLine(
        currentBoard,
        i,
        color,
        row,
        col,
        1,
        1,
        ballsToClear,
      ); // Chéo chính
      // Kiểm tra chéo trái-xuống
      this.checkAndAddLine(
        currentBoard,
        i,
        color,
        row,
        col,
        1,
        -1,
        ballsToClear,
      ); // Chéo phụ
    }

    if (ballsToClear.size > 0) {
      totalClearedCount = ballsToClear.size;
      for (const idx of ballsToClear) {
        currentBoard[idx] = '-'; // Xóa bóng
      }
    }
    return { clearedBoard: currentBoard, clearedCount: totalClearedCount };
  }

  private checkAndAddLine(
    board: GameBoard,
    startIdx: number,
    color: BoardCell,
    startRow: number,
    startCol: number,
    deltaRow: number,
    deltaCol: number,
    ballsToClear: Set<number>,
  ) {
    const line: number[] = [];
    // Kiểm tra theo một hướng (ví dụ: sang phải, xuống dưới)
    for (let i = 0; i < MIN_LINE_TO_CLEAR; i++) {
      const currentRow = startRow + i * deltaRow;
      const currentCol = startCol + i * deltaCol;
      const currentIdx = currentRow * BOARD_SIZE + currentCol;

      if (
        currentRow >= 0 &&
        currentRow < BOARD_SIZE &&
        currentCol >= 0 &&
        currentCol < BOARD_SIZE &&
        board[currentIdx] === color
      ) {
        line.push(currentIdx);
      } else {
        break;
      }
    }

    if (line.length >= MIN_LINE_TO_CLEAR) {
      line.forEach((idx) => ballsToClear.add(idx));
    }
  }

  private findPotentialLines(board: GameBoard): number {
    let potentialLines = 0;

    for (let i = 0; i < TOTAL_CELLS; i++) {
      const color = board[i];
      if (color === '-') continue;

      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;

      // Check horizontal, vertical, and both diagonals for 4 balls
      // horizontal
      if (col <= BOARD_SIZE - 4) {
        let count = 0;
        for (let k = 0; k < 4; k++)
          if (board[row * BOARD_SIZE + col + k] === color) count++;
        if (count === 4) potentialLines++;
      }
      // vertical
      if (row <= BOARD_SIZE - 4) {
        let count = 0;
        for (let k = 0; k < 4; k++)
          if (board[(row + k) * BOARD_SIZE + col] === color) count++;
        if (count === 4) potentialLines++;
      }
      // diagonal \
      if (row <= BOARD_SIZE - 4 && col <= BOARD_SIZE - 4) {
        let count = 0;
        for (let k = 0; k < 4; k++)
          if (board[(row + k) * BOARD_SIZE + col + k] === color) count++;
        if (count === 4) potentialLines++;
      }
      // diagonal /
      if (row <= BOARD_SIZE - 4 && col >= 3) {
        let count = 0;
        for (let k = 0; k < 4; k++)
          if (board[(row + k) * BOARD_SIZE + col - k] === color) count++;
        if (count === 4) potentialLines++;
      }
    }
    return potentialLines;
  }
}

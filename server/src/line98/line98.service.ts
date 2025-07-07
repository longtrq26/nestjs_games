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
  EMPTY_CELL,
  INITIAL_BALLS,
  MIN_LINE_TO_CLEAR,
  NEW_BALLS_PER_TURN,
  TOTAL_CELLS,
} from 'src/lib/constants';
import {
  BoardCell,
  GameBoard,
  HintMove,
  Line98GameStatePayload,
  Path,
} from 'src/lib/types';

@Injectable()
export class Line98Service {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: string): Promise<Line98Game> {
    // Khởi tạo board rỗng
    const initialBoard: GameBoard = Array(TOTAL_CELLS).fill(EMPTY_CELL);

    // Đặt random 5 bóng khởi đầu
    this.placeRandomBalls(initialBoard, INITIAL_BALLS);

    // Tạo 3 bóng tiếp theo
    const nextBalls: BoardCell[] = this.generateRandomBalls(NEW_BALLS_PER_TURN);

    const newGame = await this.prisma.line98Game.create({
      data: {
        userId,
        boardState: initialBoard.join(''),
        nextBalls: nextBalls.join(''),
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

    return this.toGameStatePayload(game);
  }

  async moveBall(
    gameId: string,
    userId: string,
    from: number,
    to: number,
  ): Promise<Line98GameStatePayload> {
    const game = await this.findValidGame(gameId, userId);
    const board = game.boardState.split('');
    const ballColor = board[from];

    if (ballColor === EMPTY_CELL)
      throw new BadRequestException('Không có bóng ở vị trí bắt đầu.');
    if (board[to] !== EMPTY_CELL)
      throw new BadRequestException('Ô đích không trống.');

    const path = this.findPath(board, from, to);
    if (!path) throw new BadRequestException('Không tìm thấy đường đi hợp lệ.');

    // Move
    board[to] = ballColor;
    board[from] = EMPTY_CELL;

    let score = game.score;
    let nextBalls = game.nextBalls;

    // Xử lý bóng nổ sau khi move
    const clearResultAfterMove = this.clearLines(board);
    let updatedBoard = clearResultAfterMove.clearedBoard;
    score += clearResultAfterMove.clearedCount;

    // Nếu không có bóng nổ, spawn bóng mới
    if (clearResultAfterMove.clearedCount === 0) {
      const nextBallsList = nextBalls.split('');
      const emptyCells = this.getEmptyCells(updatedBoard);

      if (emptyCells.length < nextBallsList.length) {
        throw new BadRequestException('Hết chỗ trống. Game Over!');
      }

      this.placeSpecificBalls(updatedBoard, nextBallsList);

      // Kiểm tra lại nổ sau khi sinh
      const clearResultAfterSpawn = this.clearLines(updatedBoard);
      updatedBoard = clearResultAfterSpawn.clearedBoard;
      score += clearResultAfterSpawn.clearedCount;

      // Tạo bóng tiếp theo
      nextBalls = this.generateRandomBalls(NEW_BALLS_PER_TURN).join('');
    }

    const emptyCellsAfterAll = this.getEmptyCells(updatedBoard);
    const hasMoreMoves = this.clearLines(updatedBoard).clearedCount > 0;

    if (emptyCellsAfterAll.length === 0 && !hasMoreMoves) {
      throw new BadRequestException(
        'Board đầy và không còn đường để ghi điểm. Game Over!',
      );
    }

    const updatedGame = await this.prisma.line98Game.update({
      where: { id: gameId },
      data: {
        boardState: updatedBoard.join(''),
        nextBalls,
        score,
        status: Line98GameStatus.IN_PROGRESS,
      },
    });

    return this.toGameStatePayload(updatedGame);
  }

  async getHint(gameId: string, userId: string): Promise<HintMove | null> {
    const game = await this.findValidGame(gameId, userId);

    if (game.status === Line98GameStatus.FINISHED) {
      return null; // Không có gợi ý nếu game đã kết thúc
    }

    const board: GameBoard = game.boardState.split('');
    const nextBalls = game.nextBalls.split('');
    const possibleMoves: HintMove[] = [];

    for (let from = 0; from < TOTAL_CELLS; from++) {
      if (board[from] === EMPTY_CELL) continue;

      for (let to = 0; to < TOTAL_CELLS; to++) {
        if (board[to] !== EMPTY_CELL) continue;

        const path = this.findPath(board, from, to);
        if (!path) continue;

        const simulatedMove = this.simulateMove(board, from, to);

        const clearScore = this.evaluateImmediateClear(simulatedMove);
        if (clearScore) {
          possibleMoves.push({
            from,
            to,
            score: clearScore,
            type: 'clear',
          });
          continue;
        }

        const potentialScore = this.evaluatePotentialLine(
          simulatedMove,
          nextBalls,
        );
        possibleMoves.push({
          from,
          to,
          score: potentialScore,
          type: potentialScore > 1 ? 'potential_line' : 'movable',
        });
      }
    }

    // Trả về gợi ý có điểm cao nhất
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

    // Xáo trộn mảng emptyCells để chọn ngẫu nhiên các vị trí
    this.shuffleArray(emptyCells);

    for (let i = 0; i < ballsToPlace.length; i++) {
      if (i >= emptyCells.length) break; // Đảm bảo không vượt quá số ô trống
      const position = emptyCells[i];
      board[position] = ballsToPlace[i];
    }
  }

  private placeSpecificBalls(board: GameBoard, balls: BoardCell[]): void {
    const emptyCells = this.getEmptyCells(board);

    // Không cần xử lý game over ở đây, đã xử lý trong moveBall
    if (emptyCells.length < balls.length) {
      console.warn('Không đủ ô trống cho bóng mới.');
      return;
    }

    // Xáo trộn mảng emptyCells để chọn ngẫu nhiên các vị trí
    this.shuffleArray(emptyCells);

    for (let i = 0; i < balls.length; i++) {
      const position = emptyCells[i]; // Lấy từ mảng đã xáo trộn
      board[position] = balls[i];
    }
  }

  private getEmptyCells(board: GameBoard): number[] {
    const emptyCells: number[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (board[i] === EMPTY_CELL) {
        emptyCells.push(i);
      }
    }
    return emptyCells;
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
        // Đường đi hợp lệ nếu ô trống hoặc là ô đích
        if (
          !visited.has(neighborIdx) &&
          (board[neighborIdx] === EMPTY_CELL || neighborIdx === endIdx)
        ) {
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
    let ballsToClear: Set<number> = new Set();

    // Duyệt qua từng ô để tìm các đường
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const color = currentBoard[i];
      if (color === EMPTY_CELL) continue;

      const row = Math.floor(i / BOARD_SIZE);
      const col = i % BOARD_SIZE;

      // Kiểm tra ngang
      this.collectLineIndices(
        currentBoard,
        color,
        row,
        col,
        0,
        1,
        ballsToClear,
      );
      // Kiểm tra dọc
      this.collectLineIndices(
        currentBoard,
        color,
        row,
        col,
        1,
        0,
        ballsToClear,
      );
      // Kiểm tra chéo phải-xuống
      this.collectLineIndices(
        currentBoard,
        color,
        row,
        col,
        1,
        1,
        ballsToClear,
      );
      // Kiểm tra chéo trái-xuống
      this.collectLineIndices(
        currentBoard,
        color,
        row,
        col,
        1,
        -1,
        ballsToClear,
      );
    }

    const totalClearedCount = ballsToClear.size;
    if (totalClearedCount > 0) {
      for (const idx of ballsToClear) {
        currentBoard[idx] = EMPTY_CELL; // Xóa bóng
      }
    }
    return { clearedBoard: currentBoard, clearedCount: totalClearedCount };
  }

  private collectLineIndices(
    board: GameBoard,
    color: BoardCell,
    startRow: number,
    startCol: number,
    deltaRow: number,
    deltaCol: number,
    ballsToClear: Set<number>,
  ) {
    const fullLine = this.scanLine(
      board,
      color,
      startRow,
      startCol,
      deltaRow,
      deltaCol,
    );

    if (fullLine.length >= MIN_LINE_TO_CLEAR) {
      fullLine.forEach((idx) => ballsToClear.add(idx));
    }
  }

  private scanLine(
    board: GameBoard,
    color: BoardCell,
    row: number,
    col: number,
    deltaRow: number,
    deltaCol: number,
  ): number[] {
    const line: number[] = [];

    // Đi xuôi
    for (let i = 0; i < BOARD_SIZE; i++) {
      const r = row + i * deltaRow;
      const c = col + i * deltaCol;
      if (!this.isInBounds(r, c)) break;

      const idx = r * BOARD_SIZE + c;
      if (board[idx] === color) line.push(idx);
      else break;
    }

    // Đi ngược
    const reverseLine: number[] = [];
    for (let i = 1; i < BOARD_SIZE; i++) {
      const r = row - i * deltaRow;
      const c = col - i * deltaCol;
      if (!this.isInBounds(r, c)) break;

      const idx = r * BOARD_SIZE + c;
      if (board[idx] === color) reverseLine.push(idx);
      else break;
    }

    return [...reverseLine.reverse(), ...line];
  }

  private isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
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

  private async findValidGame(gameId: string, userId: string) {
    const game = await this.prisma.line98Game.findUnique({
      where: { id: gameId },
    });
    if (!game) throw new NotFoundException('Không tìm thấy game.');
    if (game.userId !== userId)
      throw new BadRequestException('Bạn không phải chủ sở hữu game này.');
    if (game.status === Line98GameStatus.FINISHED)
      throw new BadRequestException('Game đã kết thúc.');
    return game;
  }

  private toGameStatePayload(game: Line98Game): Line98GameStatePayload {
    return {
      gameId: game.id,
      boardState: game.boardState.split(''),
      nextBalls: game.nextBalls.split(''),
      score: game.score,
      status: game.status,
    };
  }

  private simulateMove(board: GameBoard, from: number, to: number): GameBoard {
    const copy = [...board];
    copy[to] = copy[from];
    copy[from] = EMPTY_CELL;
    return copy;
  }

  private evaluateImmediateClear(board: GameBoard): number | null {
    const { clearedCount } = this.clearLines(board);
    return clearedCount >= MIN_LINE_TO_CLEAR ? clearedCount * 100 : null;
  }

  private evaluatePotentialLine(
    board: GameBoard,
    nextBalls: BoardCell[],
  ): number {
    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length < nextBalls.length) return 1; // Không đủ chỗ để sinh bóng mới → chỉ là một nước đi "movable"

    const clonedBoard = [...board];
    const randomPositions = this.getRandomEmptyCells(
      emptyCells,
      nextBalls.length,
    );

    for (let i = 0; i < nextBalls.length; i++) {
      clonedBoard[randomPositions[i]] = nextBalls[i];
    }

    const potentialLines = this.findPotentialLines(clonedBoard);

    // Nếu tạo ra được đường gần đủ (ví dụ 4 bóng), thì là 'potential_line'
    return potentialLines > 0 ? potentialLines * 10 : 1;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private getRandomEmptyCells(emptyCells: number[], count: number): number[] {
    const shuffled = [...emptyCells].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

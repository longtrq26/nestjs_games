export interface AuthState {
  user: { id: string; username: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface Line98Response<T> {
  message: string;
  data: T;
}

export interface Line98GameStatePayload {
  gameId: string;
  boardState: string[];
  nextBalls: string[];
  score: number;
  status: "IN_PROGRESS" | "FINISHED";
}

export interface Line98Server {
  id: string;
  userId: string;
  boardState: string;
  nextBalls: string;
  score: number;
  status: "IN_PROGRESS" | "FINISHED";
  createdAt: string;
  updatedAt: string;
}

export interface Line98Client {
  gameId: string;
  boardState: string[];
  nextBalls: string[];
  score: number;
  status: "IN_PROGRESS" | "FINISHED";
}

export interface HintMove {
  from: number;
  to: number;
  score: number;
  type: "clear" | "potential_line" | "movable";
}

export type CellValue = "X" | "O" | null;

export interface TicTacToeGameState {
  board: CellValue[][];
  currentPlayer: "X" | "O";
  winner: "X" | "O" | "Draw" | null;
  status: "Waiting" | "Playing" | "Finished";
  playerXId: string | null;
  playerOId: string | null;
  playerXUsername: string | null;
  playerOUsername: string | null;
  isHost: boolean;
  roomId: string | null;
  gameId: string | null;
  message: string | null;
}

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

export enum TicTacToeGameStatus {
  WAITING_FOR_PLAYER = "WAITING_FOR_PLAYER",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
  ABORTED = "ABORTED",
}

export enum TicTacToePlayerSymbol {
  X = "X",
  O = "O",
}

export interface TicTacToeGameState {
  gameId: string | null;
  board: CellValue[][];
  currentPlayerSymbol: TicTacToePlayerSymbol | null;
  winnerSymbol: TicTacToePlayerSymbol | null;
  status: TicTacToeGameStatus | null;
  player1Id: string | null;
  player2Id: string | null;
  player1Symbol: TicTacToePlayerSymbol | null;
  player2Symbol: TicTacToePlayerSymbol | null;
  player1Username: string | null;
  player2Username: string | null;
  isHost: boolean;
  message: string | null;
}

export interface TicTacToeGameStatePayload {
  gameId: string;
  board: string[]; // server gửi chuỗi ["X", "", "", ..., "O"]
  currentPlayerSymbol: TicTacToePlayerSymbol | null;
  winnerSymbol: TicTacToePlayerSymbol | null;
  status: TicTacToeGameStatus;
  player1Id: string;
  player2Id: string | null;
  player1Symbol: TicTacToePlayerSymbol;
  player2Symbol: TicTacToePlayerSymbol;
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
  board: string[]; // Flat array from server
}

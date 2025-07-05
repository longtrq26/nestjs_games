import { Line98GameStatePayload } from "@/state/api/line98Api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";

// Định nghĩa kiểu dữ liệu cho ô trên bàn cờ
export type CellValue = "X" | "O" | null;

// Định nghĩa kiểu dữ liệu cho trạng thái của một game Tic Tac Toe
interface TicTacToeGameState {
  board: CellValue[][]; // Bàn cờ 3x3
  currentPlayer: "X" | "O";
  winner: "X" | "O" | "Draw" | null;
  status: "waiting" | "playing" | "finished";
  playerXId: string | null;
  playerOId: string | null;
  playerXUsername: string | null;
  playerOUsername: string | null;
  isHost: boolean; // Để biết người dùng hiện tại có phải là người tạo phòng không
  roomId: string | null; // ID phòng game (sẽ đồng nhất với gameId)
  gameId: string | null; // ID game trên backend
  message: string | null; // Thông báo trạng thái hoặc lỗi
}

interface GameState {
  currentTicTacToeGame: TicTacToeGameState | null;
  currentLine98Game: Line98GameStatePayload | null;
}

const initialTicTacToeGameState: TicTacToeGameState = {
  board: Array(3)
    .fill(null)
    .map(() => Array(3).fill(null)),
  currentPlayer: "X",
  winner: null,
  status: "waiting",
  playerXId: null,
  playerOId: null,
  playerXUsername: null,
  playerOUsername: null,
  isHost: false,
  roomId: null,
  gameId: null,
  message: null,
};

const initialState: GameState = {
  currentTicTacToeGame: null,
  currentLine98Game: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Actions để khởi tạo hoặc cập nhật trạng thái game Tic Tac Toe
    setTicTacToeGame(state, action: PayloadAction<TicTacToeGameState | null>) {
      state.currentTicTacToeGame = action.payload;
    },

    resetTicTacToeGame(state) {
      state.currentTicTacToeGame = { ...initialTicTacToeGameState };
    },

    // Action để đặt/cập nhật toàn bộ trạng thái game Line 98
    setLine98Game(state, action: PayloadAction<Line98GameStatePayload | null>) {
      state.currentLine98Game = action.payload;
    },
    // Action để reset game Line 98
    resetLine98Game(state) {
      state.currentLine98Game = null; // Đặt về null để bắt đầu game mới
    },
  },
});

export const {
  setTicTacToeGame,
  resetTicTacToeGame,
  setLine98Game,
  resetLine98Game,
} = gameSlice.actions;

export default gameSlice.reducer;

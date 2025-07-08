import { CellValue, TicTacToeGameState, TicTacToeGameStatus } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";

const initialState: TicTacToeGameState = {
  gameId: null,
  board: Array(3)
    .fill(null)
    .map(() => Array(3).fill(null) as CellValue[]),
  currentPlayerSymbol: null,
  winnerSymbol: null,
  status: null as TicTacToeGameStatus | null,
  player1Id: null,
  player2Id: null,
  player1Symbol: null, // Đảm bảo có trường này
  player2Symbol: null, // Đảm bảo có trường này
  player1Username: null,
  player2Username: null,
  isHost: false,
  message: null,
};

const ticTacToeSlice = createSlice({
  name: "ticTacToeGame",
  initialState,
  reducers: {
    setTicTacToeGame: (_, action: PayloadAction<TicTacToeGameState>) =>
      action.payload,
    resetTicTacToeGame: () => initialState,
  },
});

export const { setTicTacToeGame, resetTicTacToeGame } = ticTacToeSlice.actions;
export default ticTacToeSlice.reducer;

import { TicTacToeGameState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";

const initialState: TicTacToeGameState = {
  board: Array(3)
    .fill(null)
    .map(() => Array(3).fill(null)),
  currentPlayer: "X",
  winner: null,
  status: "Waiting",
  playerXId: null,
  playerOId: null,
  playerXUsername: null,
  playerOUsername: null,
  isHost: false,
  roomId: null,
  gameId: null,
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

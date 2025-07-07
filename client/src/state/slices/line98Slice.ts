import { Line98GameStatePayload } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit/react";

interface Line98GameState {
  current: Line98GameStatePayload | null;
}

const initialState: Line98GameState = {
  current: null,
};

const line98Slice = createSlice({
  name: "line98Game",
  initialState,
  reducers: {
    setLine98Game(state, action: PayloadAction<Line98GameStatePayload | null>) {
      state.current = action.payload;
    },
    resetLine98Game(state) {
      state.current = null;
    },
  },
});

export const { setLine98Game, resetLine98Game } = line98Slice.actions;
export default line98Slice.reducer;

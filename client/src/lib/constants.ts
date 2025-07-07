export const BOARD_SIZE = 9;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
export const EMPTY_CELL = "-";

export const INITIAL_BALLS = 5;
export const NEW_BALLS_PER_TURN = 3;
export const MIN_LINE_TO_CLEAR = 5;

export const MONO_BALL_STYLE_MAP: Record<string, string> = {
  R: "from-red-400 to-red-600",
  G: "from-green-400 to-green-600",
  B: "from-blue-400 to-blue-600",
  Y: "from-yellow-400 to-yellow-600",
  P: "from-purple-400 to-purple-600",
  C: "from-cyan-400 to-cyan-600",
  M: "from-fuchsia-400 to-fuchsia-600",
  default: "from-gray-400 to-gray-600",
};

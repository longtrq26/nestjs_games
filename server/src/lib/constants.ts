import { BallColor, BoardCell } from './types';

export const IS_PUBLIC_KEY = 'isPublic';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 32;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const BOARD_SIZE = 9;
export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
export const EMPTY_CELL: BoardCell = '-';
export const BALL_COLORS: BallColor[] = Object.values(BallColor);
export const INITIAL_BALLS = 5;
export const NEW_BALLS_PER_TURN = 3;
export const MIN_LINE_TO_CLEAR = 5;

export const safeUserSelect = {
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
};

export type BoardCell = string;

export type GameBoard = BoardCell[];

export enum BallColor {
  Red = 'R',
  Green = 'G',
  Blue = 'B',
  Yellow = 'Y',
  Purple = 'P',
  Cyan = 'C',
  Magenta = 'M',
}

export type Path = number[];

export interface HintMove {
  from: number;
  to: number;
  score: number;
  type: 'clear' | 'potential_line' | 'movable';
}

export interface Line98GameStatePayload {
  gameId: string;
  boardState: string[];
  nextBalls: string[];
  score: number;
  status: 'IN_PROGRESS' | 'FINISHED';
}

export interface Line98Response<T = any> {
  message: string;
  data: T;
}

import { CellValue } from "@/state/redux/slices/gameSlice";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertBoardStringTo2D = (boardString?: string): CellValue[][] => {
  if (!boardString || boardString.length !== 9) {
    console.error("❌ Invalid board string:", boardString);
    return Array(3)
      .fill(null)
      .map(() => Array(3).fill(null));
  }

  const board: CellValue[][] = [];
  for (let i = 0; i < 3; i++) {
    board[i] = [];
    for (let j = 0; j < 3; j++) {
      const char = boardString[i * 3 + j];
      board[i][j] = char === "X" ? "X" : char === "O" ? "O" : null;
    }
  }
  return board;
};

import { CellValue, PlayerJoinedPayload, TicTacToeGameState } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BOARD_SIZE, EMPTY_CELL, TOTAL_CELLS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert board string to 2D board using dynamic board size
export function convertBoardStringTo2D(boardStr: string): CellValue[][] {
  const board: CellValue[][] = [];
  for (let i = 0; i < 9; i += 3) {
    board.push(
      boardStr
        .slice(i, i + 3)
        .split("")
        .map((cell) => (cell === "X" || cell === "O" ? cell : null))
    );
  }
  return board;
}

// Find path using BFS (client-side)
export const findPath = (
  boardState: string[],
  start: number,
  target: number
): number[] | null => {
  if (
    start < 0 ||
    start >= TOTAL_CELLS ||
    target < 0 ||
    target >= TOTAL_CELLS
  ) {
    return null;
  }

  if (start === target) return [start];

  const isBlocked = (index: number) => boardState[index] !== EMPTY_CELL;
  if (isBlocked(target) && target !== start) return null;

  const queue: number[] = [start];
  const visited = new Set<number>([start]);
  const parentMap = new Map<number, number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === target) {
      const path: number[] = [];
      let node = target;
      while (node !== start) {
        path.unshift(node);
        node = parentMap.get(node)!;
      }
      path.unshift(start);
      return path;
    }

    for (const neighbor of getNeighbors(current)) {
      if (
        !visited.has(neighbor) &&
        (boardState[neighbor] === EMPTY_CELL || neighbor === target)
      ) {
        visited.add(neighbor);
        parentMap.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
};

// Get valid adjacent cells (up, down, left, right)
const getNeighbors = (index: number): number[] => {
  const neighbors: number[] = [];
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;

  if (row > 0) neighbors.push(index - BOARD_SIZE); // Up
  if (row < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < BOARD_SIZE - 1) neighbors.push(index + 1); // Right

  return neighbors;
};

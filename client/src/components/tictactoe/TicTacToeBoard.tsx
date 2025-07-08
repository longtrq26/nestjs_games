// src/components/TicTacToeBoard.tsx
"use client";

import { cn } from "@/lib/utils";
import { CellValue, TicTacToeGameStatus } from "@/types"; // Import TicTacToeGameStatus
import { Fragment } from "react";

interface TicTacToeBoardProps {
  board: CellValue[][];
  onCellClick: (row: number, col: number) => void;
  isCurrentPlayerTurn: boolean;
  gameStatus: "waiting" | "playing" | "finished"; // Giữ nguyên type này để tránh thay đổi quá nhiều component
}

const TicTacToeBoard = ({
  board,
  onCellClick,
  isCurrentPlayerTurn,
  gameStatus,
}: TicTacToeBoardProps) => {
  const isBoardClickable = isCurrentPlayerTurn && gameStatus === "playing";

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-950 border-4 border-gray-800 rounded-lg shadow-2xl">
      {board.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          {Array.isArray(row) &&
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={!!cell || !isBoardClickable}
                className={cn(
                  "w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl font-extrabold rounded-md",
                  "transition-all duration-300 ease-in-out",
                  "bg-gray-800 text-white", // Default cell appearance
                  !cell &&
                    isBoardClickable &&
                    "hover:bg-gray-700 active:scale-95 cursor-pointer", // Clickable state
                  cell === "X" && "text-red-500", // X color
                  cell === "O" && "text-blue-500", // O color
                  !!cell && "cursor-not-allowed", // Cell already filled
                  !isBoardClickable && !cell && "opacity-70 cursor-not-allowed" // Not clickable and empty
                )}
              >
                {cell}
              </button>
            ))}
        </Fragment>
      ))}
    </div>
  );
};

export default TicTacToeBoard;

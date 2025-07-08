// src/components/TicTacToeBoard.tsx
"use client";

import { cn } from "@/lib/utils";
import { CellValue } from "@/types"; // Import TicTacToeGameStatus

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
    <div className="flex justify-center items-center w-full">
      <div
        className={cn(
          "grid gap-0.5 border border-gray-300 bg-white rounded-md overflow-hidden shadow-xl",
          "p-1",
          "grid-cols-3"
        )}
        style={{
          width: "min(100%, 360px)",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isEmpty = !cell;
            const isDisabled = !!cell || !isBoardClickable;

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={isDisabled}
                className={cn(
                  "flex items-center justify-center aspect-square",
                  "text-5xl md:text-6xl font-extrabold",
                  "transition-all duration-200",
                  "border border-gray-200 bg-white text-gray-900",
                  "hover:bg-gray-50 active:scale-95",
                  "w-[90px] md:w-[100px] lg:w-[110px]",

                  cell === "X" && "text-red-500",
                  cell === "O" && "text-blue-500",

                  isEmpty &&
                    !isBoardClickable &&
                    "opacity-50 cursor-not-allowed",

                  !!cell && "cursor-not-allowed"
                )}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TicTacToeBoard;

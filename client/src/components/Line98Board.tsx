"use client";

import { BOARD_SIZE, TAILWIND_BALL_COLOR_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Line98BoardProps {
  boardState: string[];
  selectedCell: number | null;
  path: number[] | null;
  onCellClick: (index: number) => void;
  onAnimationEnd: () => void;
}

const Line98Board = ({
  boardState,
  selectedCell,
  path,
  onCellClick,
  onAnimationEnd,
}: Line98BoardProps) => {
  return (
    <div
      className="grid gap-0.5 border-2 border-gray-600 bg-gray-800 shadow-2xl rounded-lg overflow-hidden p-0.5"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        width: "fit-content",
        height: "fit-content",
        maxWidth: `calc(${BOARD_SIZE * 60}px + ${BOARD_SIZE * 0.5}px + 4px)`,
        maxHeight: `calc(${BOARD_SIZE * 60}px + ${BOARD_SIZE * 0.5}px + 4px)`,
      }}
    >
      {boardState.map((ballChar, index) => {
        const isSelected = selectedCell === index;
        const isPathCell = path?.includes(index);
        const isLastInPath = path && index === path[path.length - 1];
        const hasBall = ballChar !== "-";

        return (
          <div
            key={index}
            onClick={() => onCellClick(index)}
            className={cn(
              "relative flex items-center justify-center transition-colors duration-150",
              "w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] md:w-[60px] md:h-[60px]",
              "aspect-square bg-gray-900 border border-gray-700",
              !hasBall && "hover:bg-gray-700 cursor-pointer",
              isSelected && "border-4 border-blue-400 shadow-inner-lg z-10",
              isPathCell && !isLastInPath && "bg-gray-700/50"
            )}
          >
            {hasBall && (
              <div
                className={cn(
                  "absolute rounded-full flex items-center justify-center",
                  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-[70%] aspect-square border-2 border-transparent transition-all",
                  `bg-gradient-to-br ${
                    TAILWIND_BALL_COLOR_MAP[ballChar] ||
                    "from-gray-500 to-gray-400"
                  }`,
                  "ball-shadow",
                  // Animation logic
                  path && isPathCell && index === selectedCell
                    ? "ball-move-animation"
                    : "ball-pop-animation",
                  isSelected
                    ? "scale-105 shadow-xl ring-4 ring-blue-300 ring-opacity-70"
                    : "scale-90"
                )}
                style={{
                  animationDuration: path ? `${path.length * 100}ms` : "300ms",
                  animationDelay:
                    path && isPathCell
                      ? `${path.indexOf(index) * 100}ms`
                      : "0ms",
                }}
                onAnimationEnd={() => {
                  if (isLastInPath) {
                    onAnimationEnd();
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Line98Board;

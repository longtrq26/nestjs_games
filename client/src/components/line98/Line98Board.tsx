"use client";

import { BOARD_SIZE, MONO_BALL_STYLE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Line98BoardProps {
  boardState: string[];
  selectedCell: number | null;
  path: number[] | null;
  hintPath: number[] | null;
  onCellClick: (index: number) => void;
  onBallAnimationEnd: () => void;
}

const Line98Board = ({
  boardState,
  selectedCell,
  path,
  hintPath,
  onCellClick,
  onBallAnimationEnd,
}: Line98BoardProps) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div
        className="grid mx-auto gap-0.5 border border-gray-300 bg-white rounded-md overflow-hidden shadow-xl"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: `${BOARD_SIZE * 60}px`,
        }}
      >
        {boardState.map((ballChar, index) => {
          const isSelected = selectedCell === index;
          const hasBall = ballChar !== "-";

          const isHintPathCell = hintPath?.includes(index);
          const isHintSource = hintPath && index === hintPath[0];
          const isHintTarget =
            hintPath && index === hintPath[hintPath.length - 1];
          const isMovingPathCell = path?.includes(index);
          const isLastInMovingPath = path && index === path[path.length - 1];

          return (
            <div
              key={index}
              onClick={() => onCellClick(index)}
              className={cn(
                "relative flex items-center justify-center",
                "w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] md:w-[60px] md:h-[60px]",
                "aspect-square border bg-white",
                hasBall
                  ? "border-gray-200"
                  : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 cursor-pointer",
                isSelected && "border-4 border-blue-500 z-20 shadow-inner",
                isMovingPathCell && !isLastInMovingPath && "bg-blue-100/30",

                isHintPathCell && "bg-indigo-100/50 ring-2 ring-indigo-300",
                isHintSource &&
                  "border-4 border-indigo-500 ring-2 ring-indigo-300",
                isHintTarget &&
                  !hasBall &&
                  "border-4 border-emerald-500 ring-2 ring-emerald-300"
              )}
            >
              <AnimatePresence>
                {hasBall && (
                  <motion.div
                    key={ballChar + index}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: isSelected ? 1.15 : 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    onAnimationComplete={() => {
                      if (isLastInMovingPath) onBallAnimationEnd();
                    }}
                    className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      "w-[75%] aspect-square rounded-full border border-gray-400",
                      "bg-gradient-to-br shadow-md",
                      MONO_BALL_STYLE_MAP[ballChar] ??
                        MONO_BALL_STYLE_MAP.default,
                      isSelected ? "ring-2 ring-gray-500" : ""
                    )}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Line98Board;

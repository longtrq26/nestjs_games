import { MONO_BALL_STYLE_MAP, NEW_BALLS_PER_TURN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Line98Client } from "@/types";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Line98ControlButtons from "./Line98ControlButtons";

interface Line98ControlsProps {
  game: Line98Client | null;
  isCreatingGame: boolean;
  isGettingHint: boolean;
  onStart: () => void;
  onHint: () => void;
  onReset: () => void;
}

const Line98Controls = ({
  game,
  isCreatingGame,
  isGettingHint,
  onStart,
  onHint,
  onReset,
}: Line98ControlsProps) => {
  const isGameFinished = game?.status === "FINISHED";
  const hasGame = !!game?.gameId;
  const canUseHint = game?.status === "IN_PROGRESS";

  return (
    <div className="w-full md:w-[22rem] flex-shrink-0">
      <Card className="shadow-2xl bg-white border border-gray-200 rounded-2xl">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Game Info
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Track your game and take actions.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-4 space-y-4">
          <div className="flex justify-between text-lg font-medium text-gray-800">
            <span>Score:</span>
            <span className="font-bold text-black">{game?.score || 0}</span>
          </div>
          <div className="flex justify-between text-lg font-medium text-gray-800">
            <span>Status:</span>
            <span
              className={cn(
                "font-bold",
                game?.status === "IN_PROGRESS"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {game?.status || "No Game"}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Next Balls
            </h3>
            <div className="flex justify-center gap-2">
              {(game?.nextBalls || Array(NEW_BALLS_PER_TURN).fill("-")).map(
                (color, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-gray-300",
                      "bg-gradient-to-br",
                      MONO_BALL_STYLE_MAP[color] || MONO_BALL_STYLE_MAP.default
                    )}
                  />
                )
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <Line98ControlButtons
            hasGame={hasGame}
            isGameFinished={isGameFinished}
            isCreatingGame={isCreatingGame}
            isGettingHint={isGettingHint}
            canUseHint={canUseHint}
            onStart={onStart}
            onHint={onHint}
            onReset={onReset}
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Line98Controls;

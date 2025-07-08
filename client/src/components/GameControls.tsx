// src/components/GameControls.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface GameControlsProps {
  gameId: string | null; // Thêm dòng này
  onHostGame: () => void;
  onJoinGame: (roomIdToJoin: string) => void;
  onLeaveGame: () => void;
  onRematch: () => void;
  gameStatus: "waiting" | "playing" | "finished";
  isHost: boolean;
}

const GameControls = ({
  gameId, // Thay thế roomId bằng gameId
  onHostGame,
  onJoinGame,
  onLeaveGame,
  onRematch,
  gameStatus, // Giữ nguyên gameStatus
  isHost,
}: GameControlsProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");

  // Thay thế isGameWaiting và isGameFinished bằng logic dựa trên gameStatus
  const isGameWaiting = gameStatus === "waiting";
  const isGameFinished = gameStatus === "finished";

  return (
    <Card className="w-full max-w-sm mx-auto bg-white border border-gray-200 shadow-lg rounded-xl p-6">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold text-gray-900">
          Game Lobby
        </CardTitle>
        <CardDescription className="text-md text-gray-600">
          Connect with friends or start a new challenge!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {gameId ? ( // Sử dụng gameId thay vì roomId
          <>
            <div className="text-center bg-gray-100 p-3 rounded-md border border-gray-200">
              <p className="text-lg font-semibold text-gray-800">
                Room ID:{" "}
                <span className="text-blue-600 font-extrabold tracking-wide">
                  {gameId} {/* Sử dụng gameId thay vì roomId */}
                </span>
              </p>
            </div>

            {isGameWaiting && (
              <p className="text-center text-base text-gray-600 animate-pulse">
                Waiting for an opponent to join...
              </p>
            )}

            {gameStatus === "playing" && ( // Có thể dùng gameStatus trực tiếp
              <p className="text-center text-base text-gray-600">
                Game in progress. Good luck!
              </p>
            )}

            {isGameFinished && (
              <div className="flex justify-center gap-3">
                <Button
                  onClick={onRematch}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Rematch
                </Button>
              </div>
            )}
            <Button
              onClick={onLeaveGame}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Leave Room
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onHostGame}
              className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
            >
              Host New Game
            </Button>
            <Separator className="my-3 bg-gray-300" />
            <div className="grid gap-3">
              <Label
                htmlFor="joinRoomId"
                className="text-md font-medium text-gray-800"
              >
                Join Existing Game
              </Label>
              <div className="flex gap-2">
                <Input
                  id="joinRoomId"
                  placeholder="Enter Room ID"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="flex-grow border-gray-300 focus:border-black focus:ring-black"
                />
                <Button
                  onClick={() => onJoinGame(joinRoomId)}
                  disabled={!joinRoomId}
                  className="bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Join
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GameControls;

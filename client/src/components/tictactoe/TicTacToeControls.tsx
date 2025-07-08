"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TicTacToeControlsProps {
  gameId: string | null;
  onHostGame: () => void;
  onJoinGame: (roomIdToJoin: string) => void;
  onLeaveGame: () => void;
  onRematch: () => void;
  gameStatus: "waiting" | "playing" | "finished";
  isHost: boolean;
}

const TicTacToeControls = ({
  gameId,
  onHostGame,
  onJoinGame,
  onLeaveGame,
  onRematch,
  gameStatus,
  isHost,
}: TicTacToeControlsProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");
  const isGameWaiting = gameStatus === "waiting";
  const isGameFinished = gameStatus === "finished";

  return (
    <div className="w-full md:w-[22rem] flex-shrink-0">
      <Card className="shadow-2xl bg-white border border-gray-200 rounded-2xl">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            Game Lobby
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Connect with friends or start a new challenge.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-4 space-y-6">
          {gameId ? (
            <>
              <div className="bg-gray-100 px-4 py-3 rounded-md border border-gray-200 text-center">
                <p className="text-lg font-medium text-gray-700">
                  Room ID:{" "}
                  <span className="text-blue-600 font-bold tracking-wider">
                    {gameId}
                  </span>
                </p>
              </div>

              {isGameWaiting && (
                <p className="text-sm text-yellow-600 text-center animate-pulse">
                  Waiting for opponent to join...
                </p>
              )}

              {gameStatus === "playing" && (
                <p className="text-sm text-green-600 text-center">
                  Game in progress. Good luck!
                </p>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={onHostGame}
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-base font-semibold rounded-lg"
              >
                Host New Game
              </Button>

              <div className="space-y-2">
                <Label
                  htmlFor="joinRoomId"
                  className="text-sm font-medium text-gray-800"
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

        {(gameId || isGameFinished) && (
          <CardFooter className="px-6 pb-6 pt-0 flex flex-col gap-3">
            {isGameFinished && (
              <Button
                onClick={onRematch}
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Rematch
              </Button>
            )}
            <Button
              onClick={onLeaveGame}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Leave Room
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TicTacToeControls;

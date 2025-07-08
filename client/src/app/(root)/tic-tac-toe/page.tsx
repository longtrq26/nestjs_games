"use client";

import TicTacToeBoard from "@/components/tictactoe/TicTacToeBoard";
import TicTacToeControls from "@/components/tictactoe/TicTacToeControls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTicTacToeGames } from "@/hooks/useTicTacToeGames";
import { useTicTacToeSocketHandlers } from "@/hooks/useTicTacToeSocketHandlers";
import { RootState } from "@/state/store";
import { TicTacToeGameStatus, TicTacToePlayerSymbol } from "@/types";
import { useSelector } from "react-redux";

const TicTacToePage = () => {
  useTicTacToeSocketHandlers();

  const {
    handleHostGame,
    handleJoinGame,
    handleLeaveGame,
    handleRematch,
    handleCellClick,
    isMyTurn,
  } = useTicTacToeGames();

  const {
    gameId,
    board,
    currentPlayerSymbol,
    winnerSymbol,
    status,
    player1Username,
    player2Username,
    player1Symbol,
    player2Symbol,
    message,
    isHost,
  } = useSelector((state: RootState) => state.ticTacToeGame);

  const safeStatus: TicTacToeGameStatus =
    status ?? TicTacToeGameStatus.WAITING_FOR_PLAYER;

  const renderGameStatus = () => {
    if (!gameId) {
      return (
        <p className="text-lg text-gray-400">
          Ready to play? Host or join a game.
        </p>
      );
    }

    if (safeStatus === TicTacToeGameStatus.WAITING_FOR_PLAYER) {
      return (
        <p className="text-yellow-400 animate-pulse">
          {message || "Waiting for opponent..."}
        </p>
      );
    }

    if (
      [TicTacToeGameStatus.FINISHED, TicTacToeGameStatus.ABORTED].includes(
        safeStatus
      )
    ) {
      const winnerName =
        winnerSymbol === player1Symbol
          ? player1Username
          : winnerSymbol === player2Symbol
          ? player2Username
          : null;

      return (
        <p className="text-green-400 text-2xl font-semibold">
          {winnerSymbol ? `${winnerName || "Unknown"} wins!` : "It's a draw!"}
        </p>
      );
    }

    const currentUsername =
      currentPlayerSymbol === player1Symbol ? player1Username : player2Username;

    return (
      <div className="text-center">
        <p className="text-xl font-medium text-white">
          Turn:{" "}
          <span
            className={
              currentPlayerSymbol === TicTacToePlayerSymbol.X
                ? "text-red-500"
                : "text-blue-500"
            }
          >
            {currentUsername || "Unknown"} ({currentPlayerSymbol})
          </span>
        </p>
        <p className="text-sm text-gray-400">
          {isMyTurn ? "Your turn!" : "Opponent's turn!"}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 font-sans flex flex-col items-center justify-start">
      <section className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* Game Board & Info */}
        <div className="flex-1">
          <Card className="shadow-2xl bg-[#101828] border border-gray-200 rounded-2xl">
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-3xl font-extrabold text-gray-900">
                Tic Tac Toe
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1 text-base">
                {renderGameStatus()}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <div className="flex justify-between text-md text-gray-800 font-semibold mb-6">
                <div className="px-3 py-1 rounded bg-gray-100 border">
                  X:{" "}
                  <span className="text-red-600 font-bold">
                    {player1Symbol === "X"
                      ? player1Username || "Waiting..."
                      : player2Username || "Waiting..."}
                  </span>
                </div>
                <div className="px-3 py-1 rounded bg-gray-100 border">
                  O:{" "}
                  <span className="text-blue-600 font-bold">
                    {player1Symbol === "O"
                      ? player1Username || "Waiting..."
                      : player2Username || "Waiting..."}
                  </span>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <TicTacToeBoard
                  board={board}
                  onCellClick={handleCellClick}
                  isCurrentPlayerTurn={isMyTurn}
                  gameStatus={
                    status === TicTacToeGameStatus.IN_PROGRESS
                      ? "playing"
                      : status === TicTacToeGameStatus.FINISHED ||
                        status === TicTacToeGameStatus.ABORTED
                      ? "finished"
                      : "waiting"
                  }
                />
              </div>

              {(safeStatus === "FINISHED" || safeStatus === "ABORTED") && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLeaveGame}
                    className="bg-black text-white hover:bg-gray-800 transition-colors px-6 py-3 text-lg font-semibold"
                  >
                    Play Another Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Controls */}
        <TicTacToeControls
          gameId={gameId}
          onHostGame={handleHostGame}
          onJoinGame={handleJoinGame}
          onLeaveGame={handleLeaveGame}
          onRematch={handleRematch}
          gameStatus={
            safeStatus === TicTacToeGameStatus.IN_PROGRESS
              ? "playing"
              : [
                  TicTacToeGameStatus.FINISHED,
                  TicTacToeGameStatus.ABORTED,
                ].includes(safeStatus)
              ? "finished"
              : "waiting"
          }
          isHost={isHost}
        />
      </section>
    </div>
  );
};

export default TicTacToePage;

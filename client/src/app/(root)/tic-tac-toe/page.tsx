"use client";

import GameControls from "@/components/GameControls";
import TicTacToeBoard from "@/components/tictactoe/TicTacToeBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTicTacToeGames } from "@/hooks/useTicTacToeGames";
import { useTicTacToeSocketHandlers } from "@/hooks/useTicTacToeSocketHandlers";
import { RootState } from "@/state/store";
import { TicTacToeGameStatus, TicTacToePlayerSymbol } from "@/types";
import { useSelector } from "react-redux";

const TicTacToePage = () => {
  // 👇 Setup Socket.IO listeners
  useTicTacToeSocketHandlers();

  // 👇 Game actions: host/join/move/leave...
  const {
    handleHostGame,
    handleJoinGame,
    handleLeaveGame,
    handleRematch,
    handleCellClick,
    isMyTurn,
  } = useTicTacToeGames();

  // 👇 Redux state
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

  // --- UI: Game Status Message ---
  const renderGameStatus = () => {
    if (!gameId) {
      return (
        <p className="text-xl text-gray-600">
          Ready to play? Host or Join a game!
        </p>
      );
    }

    if (status === TicTacToeGameStatus.WAITING_FOR_PLAYER) {
      return (
        <p className="text-xl text-yellow-600 animate-pulse">
          {message || "Waiting for an opponent..."}
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
        <p className="text-3xl font-bold text-green-700">
          {winnerSymbol
            ? `${winnerName || "Unknown Player"} wins!`
            : "It's a Draw!"}
        </p>
      );
    }

    const currentUsername =
      currentPlayerSymbol === player1Symbol ? player1Username : player2Username;

    return (
      <div className="text-center">
        <p className="text-2xl font-semibold">
          Turn:{" "}
          <span
            className={
              currentPlayerSymbol === TicTacToePlayerSymbol.X
                ? "text-red-600"
                : "text-blue-600"
            }
          >
            {currentUsername || "Unknown"} ({currentPlayerSymbol})
          </span>
        </p>
        <p className="text-lg text-gray-600">
          {isMyTurn ? "Your turn!" : "Opponent's turn!"}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-gray-50">
      <h1 className="text-5xl font-extrabold mb-10 text-gray-900 tracking-tight">
        Cờ Caro <span className="text-black">X O</span>
      </h1>

      <div className="flex flex-col md:flex-row items-stretch gap-10 w-full max-w-6xl">
        <div className="flex-1 flex flex-col items-center">
          <Card className="p-6 w-full max-w-md mb-8 bg-white border border-gray-200 shadow-md rounded-xl text-center">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              {renderGameStatus()}
              <div className="flex justify-between w-full mt-2 text-gray-700 text-lg font-medium">
                <p className="px-2 py-1 rounded-md bg-gray-100">
                  Player X:{" "}
                  <span className="text-red-500">
                    {player1Symbol === TicTacToePlayerSymbol.X
                      ? player1Username || "Waiting..."
                      : player2Username || "Waiting..."}
                  </span>
                </p>
                <p className="px-2 py-1 rounded-md bg-gray-100">
                  Player O:{" "}
                  <span className="text-blue-500">
                    {player1Symbol === TicTacToePlayerSymbol.O
                      ? player1Username || "Waiting..."
                      : player2Username || "Waiting..."}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

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

          {[TicTacToeGameStatus.FINISHED, TicTacToeGameStatus.ABORTED].includes(
            safeStatus
          ) && (
            <div className="mt-8">
              <Button
                onClick={handleLeaveGame}
                className="bg-black text-white hover:bg-gray-800 transition-colors py-3 px-6 text-lg font-semibold"
              >
                Play Another Game
              </Button>
            </div>
          )}
        </div>

        <div className="md:w-1/3 w-full">
          <GameControls
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
        </div>
      </div>
    </div>
  );
};

export default TicTacToePage;

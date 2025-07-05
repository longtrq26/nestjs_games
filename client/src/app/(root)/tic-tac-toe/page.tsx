"use client";

import GameControls from "@/components/GameControls";
import TicTacToeBoard from "@/components/TicTacToeBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTicTacToeSocket } from "@/lib/socket";
import { convertBoardStringTo2D } from "@/lib/utils";
import {
  CellValue,
  resetTicTacToeGame,
  setTicTacToeGame,
} from "@/state/redux/slices/gameSlice";
import { AppDispatch, RootState } from "@/state/redux/store";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const TicTacToePage = () => {
  const dispatch: AppDispatch = useDispatch();
  const socket = getTicTacToeSocket();

  const currentTicTacToeGame = useSelector(
    (state: RootState) => state.game.currentTicTacToeGame
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Default board if currentTicTacToeGame is null
  const board =
    currentTicTacToeGame?.board ||
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null));

  const currentPlayer = currentTicTacToeGame?.currentPlayer;
  const winner = currentTicTacToeGame?.winner;
  const gameStatus = currentTicTacToeGame?.status || "waiting";
  const playerXId = currentTicTacToeGame?.playerXId;
  const playerOId = currentTicTacToeGame?.playerOId;
  const playerXUsername = currentTicTacToeGame?.playerXUsername;
  const playerOUsername = currentTicTacToeGame?.playerOUsername;
  const roomId = currentTicTacToeGame?.roomId; // Should be gameId
  const gameId = currentTicTacToeGame?.gameId;
  const isHost = currentTicTacToeGame?.isHost || false;
  const gameMessage = currentTicTacToeGame?.message;

  // Xác định người dùng hiện tại là 'X' hay 'O'
  const playerRole =
    user?.id === playerXId ? "X" : user?.id === playerOId ? "O" : null;
  const isMyTurn = currentPlayer === playerRole && gameStatus === "playing";

  // --- Socket.IO Event Handlers ---

  const handleGameCreated = useCallback(
    (payload: any) => {
      console.log("GameCreated:", payload);

      // Determine player X and O based on payload (assuming server sends player1Id/player2Id with their symbol)
      // It's more robust if the server sends playerX/playerO directly.
      // For now, let's assume player1 is always X if they host
      // If your backend assigns symbols explicitly (e.g., 'player1Symbol', 'player2Symbol'), use that.
      // Example structure from server: { gameId, roomId, player1Id, player1Username, boardState, currentPlayer, status }
      // Assuming 'player1' in server payload is always 'X' if they are the host.

      const initialBoard = convertBoardStringTo2D(
        payload.boardState || "---------"
      );

      dispatch(
        setTicTacToeGame({
          board: initialBoard,
          currentPlayer: payload.currentPlayer ?? "X",
          winner: null,
          status:
            payload.status === "IN_PROGRESS"
              ? "playing"
              : payload.status === "FINISHED"
              ? "finished"
              : "waiting",
          playerXId: payload.playerXId || payload.player1Id, // Backend should provide which player is X/O
          playerOId: payload.playerOId || null,
          playerXUsername: payload.playerXUsername || payload.player1Username,
          playerOUsername: null,
          isHost: true, // Host is always the one who created the game
          roomId: payload.gameId, // Use gameId consistently as roomId
          gameId: payload.gameId,
          message: "Waiting for another player to join...",
        })
      );

      toast.success(`Game Created! Share Room ID: ${payload.gameId}`);
    },
    [dispatch]
  );

  const handlePlayerJoined = useCallback(
    (payload: any) => {
      console.log("PlayerJoined:", payload);
      // Backend should send the full game state on join, including who is X and O
      // Payload example: { gameId, boardState, currentPlayer, status, playerXId, playerXUsername, playerOId, playerOUsername }

      const updatedBoard = convertBoardStringTo2D(payload.boardState);

      dispatch(
        setTicTacToeGame({
          board: updatedBoard,
          currentPlayer: payload.currentPlayer,
          winner: null,
          status:
            payload.status === "IN_PROGRESS"
              ? "playing"
              : payload.status === "FINISHED"
              ? "finished"
              : "waiting",
          playerXId: payload.playerXId,
          playerOId: payload.playerOId,
          playerXUsername: payload.playerXUsername,
          playerOUsername: payload.playerOUsername,
          isHost: currentTicTacToeGame?.isHost || false, // Preserve host status if it was set
          roomId: payload.gameId,
          gameId: payload.gameId,
          message: "Game started!",
        })
      );

      toast.success(
        `${payload.playerXUsername} vs ${payload.playerOUsername}. Game started!`
      );
    },
    [dispatch, currentTicTacToeGame] // Add currentTicTacToeGame to dependencies
  );

  const handleGameUpdated = useCallback(
    (payload: any) => {
      console.log("gameState", payload);
      // This payload should contain the full current state of the game
      // Payload example: { gameId, boardState, currentPlayer, winner, status, message }
      const updatedBoard = convertBoardStringTo2D(payload.board?.join(""));

      dispatch(
        setTicTacToeGame({
          ...currentTicTacToeGame!, // Keep existing player IDs/usernames
          board: updatedBoard,
          currentPlayer: payload.currentPlayerSymbol,
          winner: payload.winnerSymbol,
          status:
            payload.status === "IN_PROGRESS"
              ? "playing"
              : payload.status === "FINISHED"
              ? "finished"
              : "waiting",
          message: payload.message || null,
        })
      );

      if (payload.status === "FINISHED") {
        toast.info(
          payload.winner === "Draw" ? "It's a Draw!" : `${payload.winner} wins!`
        );
      }
    },
    [dispatch, toast, currentTicTacToeGame]
  );

  const handleGameFinished = useCallback(
    (payload: any) => {
      console.log("gameFinished", payload);
      const updatedBoard = convertBoardStringTo2D(payload.board.join(""));

      dispatch(
        setTicTacToeGame({
          ...currentTicTacToeGame!,
          board: updatedBoard,
          winner: payload.winnerSymbol,
          status: payload.status,
          message:
            payload.winnerSymbol === null
              ? "It’s a draw!"
              : `${payload.winnerSymbol} wins!`,
        })
      );

      if (payload.winnerSymbol === null) {
        toast.info("It’s a draw!");
      } else {
        toast.success(`${payload.winnerSymbol} wins!`);
      }
    },
    [dispatch, currentTicTacToeGame]
  );

  const handleGameError = useCallback(
    (payload: { message: string }) => {
      console.error("Game Error:", payload.message);
      toast.error(payload.message); // Using toast.error
    },
    [toast]
  );

  const handlePlayerLeft = useCallback(
    (payload: { message: string }) => {
      console.log("Player Left:", payload.message);
      dispatch(resetTicTacToeGame()); // Reset game state
      toast.info(payload.message);
    },
    [dispatch, toast]
  );

  // --- useEffect for Socket.IO Listeners ---
  useEffect(() => {
    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("gameCreated", handleGameCreated);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("gameState", handleGameUpdated);
    socket.on("gameFinished", handleGameFinished);
    socket.on("gameError", handleGameError);
    socket.on("playerLeft", handlePlayerLeft);

    return () => {
      // Clean up listeners when component unmounts
      socket.off("gameCreated", handleGameCreated);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("gameState", handleGameUpdated);
      socket.off("gameFinished", handleGameFinished);
      socket.off("gameError", handleGameError);
      socket.off("playerLeft", handlePlayerLeft);
    };
  }, [
    socket,
    handleGameCreated,
    handlePlayerJoined,
    handleGameUpdated,
    handleGameError,
    handlePlayerLeft,
  ]);

  // --- Game Actions ---

  const handleHostGame = () => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    console.log("[CLIENT] Emitting createGame");
    socket.emit("createGame");
  };

  const handleJoinGame = (roomIdToJoin: string) => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    socket.emit("joinGame", { gameId: roomIdToJoin });
  };

  const handleLeaveGame = () => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    if (gameId) {
      // Use gameId consistently
      socket.emit("leaveRoom", { gameId });
    }
    dispatch(resetTicTacToeGame());
    toast.info("You have left the game room.");
  };

  const handleRematch = () => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    if (gameId) {
      // Use gameId consistently
      socket.emit("rematchRequest", { gameId });
      toast.info("Waiting for opponent's response.");
    }
  };

  const handleCellClick = (row: number, col: number) => {
    // Check gameId for null/undefined
    if (!socket.connected || !gameId || !isMyTurn || board[row][col] !== null) {
      console.warn(
        "Cannot make move: socket not connected, no game ID, not your turn, or cell occupied."
      );
      // Optionally provide a toast here if conditions aren't met
      if (!isMyTurn) toast.warning("It's not your turn!");
      if (board[row][col] !== null)
        toast.warning("This cell is already taken!");
      return;
    }
    socket.emit("makeMove", { gameId, position: row * 3 + col });
  };

  // --- Display Game Status ---
  const renderGameStatus = () => {
    if (!currentTicTacToeGame) {
      return (
        <p className="text-xl text-gray-600 font-medium">
          Ready to play? Host or Join a game!
        </p>
      );
    }

    if (gameStatus === "waiting") {
      return (
        <p className="text-xl text-yellow-600 font-semibold animate-pulse">
          {gameMessage || "Waiting for an opponent..."}
        </p>
      );
    }

    if (gameStatus === "finished") {
      if (winner === "Draw") {
        return (
          <p className="text-3xl text-purple-700 font-extrabold">
            It's a Draw!
          </p>
        );
      }
      return (
        <p className="text-3xl text-green-700 font-extrabold">
          {winner === "X"
            ? playerXUsername || "Player X"
            : playerOUsername || "Player O"}{" "}
          wins!
        </p>
      );
    }

    // Game is playing
    const turnMessage = isMyTurn ? "Your turn!" : `Opponent's turn!`;
    const currentPlayerDisplayName =
      currentPlayer === "X"
        ? playerXUsername || "Player X"
        : playerOUsername || "Player O";
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800 mb-1">
          Turn:{" "}
          <span
            className={currentPlayer === "X" ? "text-red-600" : "text-blue-600"}
          >
            {currentPlayerDisplayName} ({currentPlayer})
          </span>
        </p>
        <p className="text-lg text-gray-600">{turnMessage}</p>
      </div>
    );
  };

  // Inside TicTacToePage component
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-gray-50">
      <h1 className="text-5xl font-extrabold mb-10 text-gray-900 tracking-tight">
        Cờ Caro <span className="text-black">X O</span>
      </h1>

      <div className="flex flex-col md:flex-row items-stretch md:items-start gap-10 w-full max-w-6xl">
        <div className="flex-1 flex flex-col items-center">
          <Card className="p-6 w-full max-w-md mb-8 bg-white border border-gray-200 shadow-md rounded-xl text-center">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              {renderGameStatus()}
              <div className="flex justify-between w-full mt-2 text-gray-700 text-lg font-medium">
                <p className="px-2 py-1 rounded-md bg-gray-100">
                  Player X:{" "}
                  <span className="text-red-500">
                    {playerXUsername || "Waiting..."}
                  </span>
                </p>
                <p className="px-2 py-1 rounded-md bg-gray-100">
                  Player O:{" "}
                  <span className="text-blue-500">
                    {playerOUsername || "Waiting..."}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
          <TicTacToeBoard
            board={board}
            onCellClick={handleCellClick}
            isCurrentPlayerTurn={isMyTurn}
            gameStatus={gameStatus}
          />
          {winner && gameStatus === "finished" && (
            <div className="mt-8">
              {/* This button could potentially be 'Play Again' or 'Return to Lobby' depending on desired flow */}
              <Button
                onClick={() => handleLeaveGame()}
                className="bg-black text-white hover:bg-gray-800 transition-colors py-3 px-6 text-lg font-semibold"
              >
                Play Another Game
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 w-full md:w-auto">
          <GameControls
            onHostGame={handleHostGame}
            onJoinGame={handleJoinGame}
            onLeaveGame={handleLeaveGame}
            onRematch={handleRematch}
            isGameWaiting={gameStatus === "waiting"}
            isGameFinished={gameStatus === "finished"}
            isHost={isHost}
            roomId={gameId ?? null}
            gameStatus={gameStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default TicTacToePage;

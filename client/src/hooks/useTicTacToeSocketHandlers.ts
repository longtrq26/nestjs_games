import { getTicTacToeSocket } from "@/lib/socket";
import { convertBoardStringTo2D } from "@/lib/utils";
import {
  resetTicTacToeGame,
  setTicTacToeGame,
} from "@/state/slices/ticTacToeSlice";
import { RootState } from "@/state/store";
import {
  GameOutcomePayload,
  PlayerJoinedPayload,
  TicTacToeGameStatePayload,
  TicTacToeGameStatus,
} from "@/types";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export const useTicTacToeSocketHandlers = () => {
  const dispatch = useDispatch();
  const socket = getTicTacToeSocket();

  const user = useSelector((state: RootState) => state.auth.user);
  const currentTicTacToeGame = useSelector(
    (state: RootState) => state.ticTacToeGame
  );

  const gameRef = useRef(currentTicTacToeGame);
  useEffect(() => {
    gameRef.current = currentTicTacToeGame;
  }, [currentTicTacToeGame]);

  const handleGameCreated = useCallback(
    (payload: TicTacToeGameStatePayload) => {
      console.log("GameCreated:", payload);

      const initialBoard = convertBoardStringTo2D(payload.board.join(""));

      dispatch(
        setTicTacToeGame({
          gameId: payload.gameId,
          board: initialBoard,
          currentPlayerSymbol: payload.currentPlayerSymbol,
          winnerSymbol: payload.winnerSymbol,
          status: payload.status,
          player1Id: payload.player1Id,
          player2Id: payload.player2Id,
          player1Symbol: payload.player1Symbol,
          player2Symbol: payload.player2Symbol,
          player1Username: user?.username || null,
          player2Username: null,
          isHost: true,
          message: "Waiting for another player to join...",
        })
      );

      toast.success(`Game Created! Share Room ID: ${payload.gameId}`);
    },
    [dispatch, user?.username]
  );

  const handlePlayerJoined = useCallback(
    (payload: PlayerJoinedPayload) => {
      console.log("PlayerJoined:", payload);
      const currentGame = gameRef.current;

      dispatch(
        setTicTacToeGame({
          ...currentGame,
          gameId: payload.gameId,
          player1Id: payload.player1Id,
          player2Id: payload.player2Id,
          player1Symbol: payload.player1Symbol,
          player2Symbol: payload.player2Symbol,
          player1Username: payload.player1Username,
          player2Username: payload.player2Username,
          message: "Game started!",
        })
      );

      toast.success(
        `${payload.player1Username} (X) vs ${payload.player2Username} (O). Game started!`
      );
    },
    [dispatch]
  );

  const handleGameState = useCallback(
    (payload: TicTacToeGameStatePayload) => {
      console.log("gameState (updated):", payload);

      const currentGame = gameRef.current;
      const updatedBoard = convertBoardStringTo2D(payload.board.join(""));

      dispatch(
        setTicTacToeGame({
          ...currentGame,
          board: updatedBoard,
          gameId: payload.gameId,
          currentPlayerSymbol: payload.currentPlayerSymbol,
          winnerSymbol: payload.winnerSymbol,
          status: payload.status,
          player1Id: payload.player1Id,
          player2Id: payload.player2Id,
          player1Symbol: payload.player1Symbol,
          player2Symbol: payload.player2Symbol,
          player1Username: currentGame.player1Username,
          player2Username: currentGame.player2Username,
          message:
            payload.status === TicTacToeGameStatus.WAITING_FOR_PLAYER
              ? "Waiting for another player to join..."
              : payload.status === TicTacToeGameStatus.IN_PROGRESS
              ? "Game in progress!"
              : payload.winnerSymbol === null
              ? "It's a draw!"
              : `${payload.winnerSymbol} wins!`,
        })
      );
    },
    [dispatch]
  );

  const handleGameFinished = useCallback(
    (payload: GameOutcomePayload) => {
      console.log("gameFinished:", payload);
      const currentGame = gameRef.current;
      const updatedBoard = convertBoardStringTo2D(payload.board.join(""));

      dispatch(
        setTicTacToeGame({
          ...currentGame,
          board: updatedBoard,
          winnerSymbol: payload.winnerSymbol,
          status: payload.status,
          currentPlayerSymbol: null,
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
    [dispatch]
  );

  const handleGameError = useCallback((payload: { message: string }) => {
    console.error("Game Error:", payload.message);
    toast.error(payload.message);
  }, []);

  const handlePlayerLeft = useCallback(
    (payload: { message?: string }) => {
      console.log("Player Left:", payload.message || "Opponent disconnected.");
      dispatch(resetTicTacToeGame());
      toast.info(payload.message || "Your opponent has left the game.");
    },
    [dispatch]
  );

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("gameCreated", handleGameCreated);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("gameState", handleGameState);
    socket.on("gameFinished", handleGameFinished);
    socket.on("error", handleGameError);
    socket.on("playerLeft", handlePlayerLeft);

    return () => {
      socket.off("gameCreated", handleGameCreated);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("gameState", handleGameState);
      socket.off("gameFinished", handleGameFinished);
      socket.off("error", handleGameError);
      socket.off("playerLeft", handlePlayerLeft);
    };
  }, [
    socket,
    handleGameCreated,
    handlePlayerJoined,
    handleGameState,
    handleGameFinished,
    handleGameError,
    handlePlayerLeft,
  ]);
};

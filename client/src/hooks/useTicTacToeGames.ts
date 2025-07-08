import { getTicTacToeSocket } from "@/lib/socket";
import { resetTicTacToeGame } from "@/state/slices/ticTacToeSlice";
import { RootState } from "@/state/store";
import { TicTacToeGameStatus } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";

export const useTicTacToeGames = () => {
  const dispatch = useDispatch();
  const socket = getTicTacToeSocket();

  const user = useSelector((state: RootState) => state.auth.user);
  const game = useSelector((state: RootState) => state.ticTacToeGame);

  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const {
    gameId,
    board,
    status,
    currentPlayerSymbol,
    player1Id,
    player2Id,
    player1Symbol,
    player2Symbol,
  } = game;

  const myPlayerSymbol = useMemo(() => {
    if (user?.id === player1Id) return player1Symbol;
    if (user?.id === player2Id) return player2Symbol;
    return null;
  }, [user?.id, player1Id, player2Id, player1Symbol, player2Symbol]);

  const isMyTurn = useMemo(() => {
    return (
      currentPlayerSymbol === myPlayerSymbol &&
      status === TicTacToeGameStatus.IN_PROGRESS
    );
  }, [currentPlayerSymbol, myPlayerSymbol, status]);

  const handleHostGame = () => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    if (gameId) {
      toast.info("You are already in a game. Please leave first.");
      return;
    }
    socket.emit("createGame");
  };

  const handleJoinGame = (roomIdToJoin: string) => {
    if (!socket.connected) {
      toast.error("Socket not connected.");
      return;
    }
    if (gameId) {
      toast.info("You are already in a game. Please leave first.");
      return;
    }
    socket.emit("joinGame", { gameId: roomIdToJoin });
  };

  const handleLeaveGame = () => {
    // Optional: socket.emit("leaveGame", { gameId })
    dispatch(resetTicTacToeGame());
    toast.info("You have left the game room.");
  };

  const handleRematch = () => {
    toast.info("Rematch feature is not implemented.");
  };

  const handleCellClick = (row: number, col: number) => {
    const { gameId, board, status, currentPlayerSymbol } = gameRef.current;
    const position = row * 3 + col;

    const isMyTurnNow =
      currentPlayerSymbol === myPlayerSymbol &&
      status === TicTacToeGameStatus.IN_PROGRESS;

    if (
      !socket.connected ||
      !gameId ||
      !isMyTurnNow ||
      board[row][col] !== null ||
      status !== TicTacToeGameStatus.IN_PROGRESS
    ) {
      if (!isMyTurnNow) toast.warning("It's not your turn!");
      if (board[row][col] !== null)
        toast.warning("This cell is already taken!");
      if (status !== TicTacToeGameStatus.IN_PROGRESS)
        toast.warning("Game is not in progress!");
      return;
    }

    socket.emit("makeMove", { gameId, position });
  };

  return {
    myPlayerSymbol,
    isMyTurn,
    handleHostGame,
    handleJoinGame,
    handleLeaveGame,
    handleRematch,
    handleCellClick,
  };
};

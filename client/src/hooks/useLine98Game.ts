import {
  useCreateLine98GameMutation,
  useGetLine98GameStateQuery,
  useGetLine98HintMutation,
  useMoveLine98BallMutation,
} from "@/state/api/line98Api";
import { resetLine98Game, setLine98Game } from "@/state/slices/line98Slice";
import { AppDispatch, RootState } from "@/state/store";
import { Line98Client } from "@/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export const useLine98Game = () => {
  const dispatch: AppDispatch = useDispatch();
  const currentLine98Game = useSelector(
    (state: RootState) => state.line98Game.current
  );
  const gameId = currentLine98Game?.gameId;

  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [hintPath, setHintPath] = useState<number[] | null>(null);
  const [movingBallPath, setMovingBallPath] = useState<number[] | null>(null);

  const [createGame, { isLoading: isCreatingGame }] =
    useCreateLine98GameMutation();
  const {
    data: fetchedGameStateResponse,
    isError: isErrorFetchingGameState,
    error: fetchError,
  } = useGetLine98GameStateQuery(gameId!, { skip: !gameId });
  const [moveBall, { isLoading: isMovingBall }] = useMoveLine98BallMutation();
  const [getHint, { isLoading: isGettingHint }] = useGetLine98HintMutation();

  useEffect(() => {
    if (
      fetchedGameStateResponse &&
      fetchedGameStateResponse.data &&
      fetchedGameStateResponse.data.gameId === gameId
    ) {
      const fetchedGameState = fetchedGameStateResponse.data;
      const formattedGameState: Line98Client = {
        gameId: fetchedGameState.gameId,
        boardState: fetchedGameState.boardState,
        nextBalls: fetchedGameState.nextBalls,
        score: fetchedGameState.score,
        status: fetchedGameState.status,
      };
      dispatch(setLine98Game(formattedGameState));
    }
  }, [fetchedGameStateResponse, dispatch, gameId]);

  useEffect(() => {
    if (isErrorFetchingGameState && fetchError) {
      const errorMessage =
        fetchError && typeof fetchError === "object" && "data" in fetchError
          ? (fetchError.data as any)?.message
          : "Failed to load game state.";
      toast.error(errorMessage);
      dispatch(resetLine98Game());
    }
  }, [isErrorFetchingGameState, fetchError, dispatch]);

  const handleCreateGame = async () => {
    try {
      const createGameResponse = await createGame().unwrap();
      const resultFromServer = createGameResponse.data;

      if (
        !resultFromServer ||
        !resultFromServer.id ||
        !resultFromServer.boardState
      ) {
        toast.error(
          "Failed to create game: Incomplete game state received from server."
        );
        return;
      }

      const newGame: Line98Client = {
        gameId: resultFromServer.id,
        boardState: resultFromServer.boardState.split(""),
        nextBalls: resultFromServer.nextBalls.split(""),
        score: resultFromServer.score,
        status: resultFromServer.status,
      };

      dispatch(setLine98Game(newGame));
      toast.success(`New game started! ID: ${newGame.gameId}`);
    } catch (err: any) {
      console.error("Failed to create game:", err);
      const errorMessage = err.data?.message || "Failed to create game.";
      toast.error(errorMessage);
    }
  };

  const handleResetGame = () => {
    dispatch(resetLine98Game());
    setSelectedCell(null);
    setHintPath(null);
    setMovingBallPath(null);
    toast.info("Game state cleared. Ready to start a new game.");
  };

  return {
    currentLine98Game,
    selectedCell,
    setSelectedCell,
    hintPath,
    setHintPath,
    movingBallPath,
    setMovingBallPath,
    isCreatingGame,
    isMovingBall,
    isGettingHint,
    handleCreateGame,
    handleResetGame,
    moveBall,
    getHint,
  };
};

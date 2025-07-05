"use client";

import Line98Board from "@/components/Line98Board";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  NEW_BALLS_PER_TURN,
  TAILWIND_BALL_COLOR_MAP,
  TOTAL_CELLS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  useCreateLine98GameMutation,
  useGetLine98GameStateQuery,
  useGetLine98HintMutation,
  useMoveLine98BallMutation,
} from "@/state/api/line98Api";
import { resetLine98Game, setLine98Game } from "@/state/redux/slices/gameSlice";
import { AppDispatch, RootState } from "@/state/redux/store";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const Line98Page = () => {
  const dispatch: AppDispatch = useDispatch();

  const currentLine98Game = useSelector(
    (state: RootState) => state.game.currentLine98Game
  );
  const gameId = currentLine98Game?.gameId;

  const [selectedCell, setSelectedCell] = useState<number | null>(null); // Ô đang chọn
  const [hintPath, setHintPath] = useState<number[] | null>(null); // Path gợi ý cho animation
  const [movingBallPath, setMovingBallPath] = useState<number[] | null>(null); // Path của bóng đang di chuyển (dùng cho animation)

  // RTK Query hooks
  const [createGame, { isLoading: isCreatingGame }] =
    useCreateLine98GameMutation();
  const {
    data: fetchedGameState,
    isLoading: isFetchingGameState,
    isError: isErrorFetchingGameState,
    error: fetchError,
    refetch,
  } = useGetLine98GameStateQuery(gameId!, {
    skip: !gameId, // Bỏ qua query nếu chưa có gameId
  });
  const [moveBall, { isLoading: isMovingBall }] = useMoveLine98BallMutation();
  const [getHint, { isLoading: isGettingHint }] = useGetLine98HintMutation();

  // Cập nhật Redux state khi game state được fetch
  useEffect(() => {
    if (fetchedGameState && fetchedGameState.gameId === gameId) {
      dispatch(setLine98Game(fetchedGameState));
    }
  }, [fetchedGameState, dispatch, gameId]);

  // Xử lý lỗi khi fetch game state
  useEffect(() => {
    if (isErrorFetchingGameState && fetchError) {
      const errorMessage =
        "data" in fetchError
          ? (fetchError.data as any).message
          : "Failed to load game state.";
      toast(errorMessage);
      // Nếu game không tồn tại, reset local state
      dispatch(resetLine98Game());
    }
  }, [isErrorFetchingGameState, fetchError, toast, dispatch]);

  // Hàm xử lý click vào ô trên bàn cờ
  const handleCellClick = async (index: number) => {
    if (
      !currentLine98Game ||
      currentLine98Game.status === "FINISHED" ||
      isMovingBall
    ) {
      return;
    }

    const board = currentLine98Game.boardState;
    const hasBall = board[index] !== "-";

    if (selectedCell === null) {
      // Chọn bóng
      if (hasBall) {
        setSelectedCell(index);
        setHintPath(null); // Xóa gợi ý khi chọn bóng mới
      } else {
        toast("Please select a ball to move.");
      }
    } else {
      // Di chuyển bóng đến ô đích
      if (index === selectedCell) {
        // Hủy chọn
        setSelectedCell(null);
        return;
      }

      if (hasBall) {
        // Nếu click vào ô có bóng khác, chọn lại bóng đó
        setSelectedCell(index);
        setHintPath(null);
        return;
      }

      // Thực hiện nước đi
      try {
        setMovingBallPath([]); // Kích hoạt animation (path sẽ được cập nhật bởi server)
        const result = await moveBall({
          gameId: currentLine98Game.gameId,
          from: selectedCell,
          to: index,
        }).unwrap();
        // RTK Query's onQueryStarted will handle state update
        setSelectedCell(null);
        setMovingBallPath(null); // Kết thúc animation
        toast("Ball moved.");
      } catch (err: any) {
        console.error("Move ball failed:", err);
        const errorMessage = err.data?.message || "Failed to move ball.";
        toast(errorMessage);
        setMovingBallPath(null); // Reset animation state on error
      } finally {
        setSelectedCell(null); // Reset selected cell after attempted move
      }
    }
  };

  // Hàm tạo game mới
  const handleCreateGame = async () => {
    try {
      const result = await createGame().unwrap();
      console.log("Game created:", result);

      // ✅ Save new gameId so useGetLine98GameStateQuery will run
      dispatch(
        setLine98Game({
          gameId: result.gameId,
          boardState: Array(TOTAL_CELLS).fill("-"), // placeholder
          nextBalls: [], // placeholder
          score: 0,
          status: "IN_PROGRESS",
        })
      );

      toast(`New game ID: ${result.gameId}`);

      // ✅ refetch to load the real game state
      refetch();
    } catch (err: any) {
      console.error("Failed to create game:", err);
      const errorMessage = err.data?.message || "Failed to create game.";
      toast(errorMessage);
    }
  };

  // Hàm reset game (khi game over hoặc muốn chơi lại)
  const handleResetGame = () => {
    dispatch(resetLine98Game());
    setSelectedCell(null);
    setHintPath(null);
    setMovingBallPath(null);
    toast("Start a new game.");
  };

  // Hàm lấy gợi ý
  const handleGetHint = async () => {
    if (!currentLine98Game || currentLine98Game.status === "FINISHED") {
      toast("No active game to get hint for.");
      return;
    }
    try {
      const result = await getHint({
        gameId: currentLine98Game.gameId,
      }).unwrap();
      if (result.hint) {
        toast(
          `Move from ${result.hint.from} to ${result.hint.to} (Type: ${result.hint.type})`
        );
        setSelectedCell(result.hint.from); // Chọn bóng theo gợi ý
        // Đây là chỗ bạn có thể hiển thị animation đường đi gợi ý
        // Hiện tại, backend không trả về path, chỉ trả về from/to.
        // Frontend cần tự tính path hoặc backend cần cung cấp.
        // Để đơn giản, chỉ highlight from/to.
        // Để có animation đường đi, chúng ta cần tìm path trên frontend.
        // Hiện tại, chỉ làm đơn giản:
        // Set a dummy path for visual feedback if hintPath is intended to animate
        // For actual path, client side pathfinding would be needed based on current board.
        // setHintPath([result.hint.from, result.hint.to]); // Example for 2 points, but a full path is better.
      } else {
        toast("No optimal hint found at this moment.");
      }
    } catch (err: any) {
      const errorMessage = err.data?.message || "Failed to get hint.";
      toast(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50 font-sans">
      {" "}
      {/* Clean background, consistent font */}
      <h1 className="text-5xl font-extrabold mb-10 text-gray-900 tracking-tight">
        Line 98
      </h1>
      <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-5xl">
        {/* Game Board Section */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          {" "}
          {/* Added min-w-0 for responsiveness */}
          <Card className="p-6 shadow-2xl rounded-xl bg-gray-900 border border-gray-700">
            {" "}
            {/* Darker card for board */}
            <CardHeader className="p-0 pb-4">
              {" "}
              {/* Adjusted padding */}
              <CardTitle className="text-3xl font-bold text-white text-center tracking-tight">
                Game Board
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex justify-center items-center">
              {" "}
              {/* Center board */}
              <Line98Board
                boardState={
                  currentLine98Game?.boardState || Array(TOTAL_CELLS).fill("-")
                }
                selectedCell={selectedCell}
                path={movingBallPath} // Truyền path cho animation di chuyển
                onCellClick={handleCellClick}
                onAnimationEnd={() => setMovingBallPath(null)} // Reset path sau animation
              />
            </CardContent>
          </Card>
        </div>

        {/* Game Info & Controls Section */}
        <div className="flex-1 w-full md:w-auto">
          <Card className="w-full max-w-sm mx-auto shadow-2xl rounded-xl bg-white border border-gray-200">
            {" "}
            {/* Consistent card styling */}
            <CardHeader className="pt-8 pb-4 text-center">
              {" "}
              {/* Adjusted padding */}
              <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Game Info
              </CardTitle>
              <CardDescription className="text-md text-gray-600 mt-2">
                Current game status and actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 px-6 py-4">
              {" "}
              {/* Adjusted spacing */}
              <div className="flex justify-between text-xl font-semibold text-gray-800">
                <span>Score:</span>
                <span className="text-black font-extrabold">
                  {currentLine98Game?.score || 0}
                </span>
              </div>
              <div className="flex justify-between text-xl font-semibold text-gray-800">
                <span>Status:</span>
                <span
                  className={cn(
                    "font-bold", // Ensure status text is bold
                    currentLine98Game?.status === "IN_PROGRESS"
                      ? "text-green-700" // Deeper green
                      : "text-red-700" // Deeper red
                  )}
                >
                  {currentLine98Game?.status || "No Game"}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-4 text-gray-800">
                Next Balls:
              </h3>
              <div className="flex justify-center gap-3 mb-4">
                {" "}
                {/* Adjusted gap */}
                {(
                  currentLine98Game?.nextBalls ||
                  Array(NEW_BALLS_PER_TURN).fill("-")
                ).map((color, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300", // Larger balls, refined border
                      TAILWIND_BALL_COLOR_MAP[color] || "bg-gray-300" // Color map for balls
                    )}
                  >
                    {/* Optional: Hiển thị ký tự màu nếu muốn */}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6 pt-0">
              {" "}
              {/* Adjusted spacing */}
              {!currentLine98Game?.gameId ? (
                <Button
                  onClick={handleCreateGame}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-semibold"
                  disabled={isCreatingGame}
                >
                  {isCreatingGame ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Game...
                    </>
                  ) : (
                    "Start New Game"
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleGetHint}
                    className="w-full bg-gray-800 text-white hover:bg-black transition-colors py-3 text-lg font-semibold"
                    disabled={
                      isGettingHint || currentLine98Game.status === "FINISHED"
                    }
                  >
                    {isGettingHint ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Getting Hint...
                      </>
                    ) : (
                      "Get Hint"
                    )}
                  </Button>
                  <Button
                    onClick={handleResetGame}
                    className="w-full border-gray-400 text-gray-800 hover:bg-gray-100 transition-colors py-3 text-lg font-semibold"
                    variant="outline" // Use outline variant for reset
                  >
                    Reset Game
                  </Button>
                </>
              )}
              {currentLine98Game?.status === "FINISHED" && (
                <p className="text-center text-xl font-extrabold text-red-700 mt-4">
                  {" "}
                  {/* More impactful Game Over */}
                  Game Over!
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Line98Page;

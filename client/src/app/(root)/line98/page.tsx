"use client";

import Line98Board from "@/components/line98/Line98Board";
import Line98Controls from "@/components/line98/Line98Controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLine98Game } from "@/hooks/useLine98Game";
import { EMPTY_CELL, TOTAL_CELLS } from "@/lib/constants";
import { findPath } from "@/lib/utils";
import React from "react";
import { toast } from "sonner";

const Line98Page = () => {
  const {
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
  } = useLine98Game();

  const handleCellClick = async (index: number) => {
    if (
      !currentLine98Game ||
      isMovingBall ||
      currentLine98Game.status === "FINISHED"
    )
      return;

    const board = currentLine98Game.boardState;
    const hasBall = board[index] !== EMPTY_CELL;

    if (selectedCell === null) {
      if (hasBall) {
        setSelectedCell(index);
        setHintPath(null);
      } else {
        toast.info("Please select a ball to move.");
      }
      return;
    }

    if (index === selectedCell) {
      setSelectedCell(null);
      setHintPath(null);
      return;
    }

    if (hasBall) {
      setSelectedCell(index);
      setHintPath(null);
      return;
    }

    const calculatedPath = findPath(board, selectedCell, index);
    if (!calculatedPath) {
      toast.warning("No valid path found to move the ball.");
      setSelectedCell(null);
      setHintPath(null);
      return;
    }

    try {
      setMovingBallPath(calculatedPath);
      setHintPath(null);

      const moveResponse = await moveBall({
        gameId: currentLine98Game.gameId,
        from: selectedCell,
        to: index,
      }).unwrap();

      if (moveResponse?.data) {
        toast.success("Ball moved successfully!");
      } else {
        toast.error("Failed to move ball: No updated game state received.");
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to move ball.");
      setMovingBallPath(null);
    } finally {
      setSelectedCell(null);
    }
  };

  const handleGetHint = async () => {
    if (!currentLine98Game || currentLine98Game.status === "FINISHED") {
      toast.info("No active game to get hint for.");
      return;
    }

    try {
      const hintResponse = await getHint({
        gameId: currentLine98Game.gameId,
      }).unwrap();

      if (hintResponse?.data) {
        const { from, to, type } = hintResponse.data;
        toast.info(`Hint: Move from ${from} to ${to} (Type: ${type})`);

        setSelectedCell(from);
        const path = findPath(currentLine98Game.boardState, from, to);
        setHintPath(path);

        setTimeout(() => {
          setHintPath(null);
          if (selectedCell === from) {
            setSelectedCell(null);
          }
        }, 5000);
      } else {
        toast.info("No optimal hint found.");
        setHintPath(null);
        setSelectedCell(null);
      }
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to get hint.");
      setHintPath(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-6 font-sans flex flex-col items-center justify-start">
      <section className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* Game Board */}
        <div className="flex-1">
          <Card className="shadow-2xl bg-gray-900 border border-gray-700 rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-3xl font-bold tracking-tight">
                Line 98
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="w-full flex justify-center">
                <Line98Board
                  boardState={
                    currentLine98Game?.boardState ||
                    Array(TOTAL_CELLS).fill(EMPTY_CELL)
                  }
                  selectedCell={selectedCell}
                  path={movingBallPath}
                  hintPath={hintPath}
                  onCellClick={handleCellClick}
                  onBallAnimationEnd={() => setMovingBallPath(null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Info & Controls */}
        <Line98Controls
          game={currentLine98Game}
          isCreatingGame={isCreatingGame}
          isGettingHint={isGettingHint}
          onStart={handleCreateGame}
          onHint={handleGetHint}
          onReset={handleResetGame}
        />
      </section>
    </div>
  );
};

export default Line98Page;

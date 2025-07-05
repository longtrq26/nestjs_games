-- CreateEnum
CREATE TYPE "TicTacToePlayerSymbol" AS ENUM ('X', 'O');

-- CreateEnum
CREATE TYPE "TicTacToeGameStatus" AS ENUM ('WAITING_FOR_PLAYER', 'IN_PROGRESS', 'FINISHED', 'ABORTED');

-- CreateTable
CREATE TABLE "TicTacToeGame" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT,
    "currentPlayerSymbol" "TicTacToePlayerSymbol",
    "status" "TicTacToeGameStatus" NOT NULL DEFAULT 'WAITING_FOR_PLAYER',
    "winnerSymbol" "TicTacToePlayerSymbol",
    "boardState" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicTacToeGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicTacToeMove" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerSymbol" "TicTacToePlayerSymbol" NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicTacToeMove_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicTacToeGame" ADD CONSTRAINT "TicTacToeGame_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicTacToeGame" ADD CONSTRAINT "TicTacToeGame_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicTacToeMove" ADD CONSTRAINT "TicTacToeMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "TicTacToeGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicTacToeMove" ADD CONSTRAINT "TicTacToeMove_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

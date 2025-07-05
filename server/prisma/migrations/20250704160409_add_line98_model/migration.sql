-- CreateEnum
CREATE TYPE "Line98GameStatus" AS ENUM ('IN_PROGRESS', 'FINISHED');

-- CreateTable
CREATE TABLE "Line98Game" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardState" TEXT NOT NULL,
    "nextBalls" TEXT NOT NULL,
    "status" "Line98GameStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Line98Game_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Line98Game" ADD CONSTRAINT "Line98Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

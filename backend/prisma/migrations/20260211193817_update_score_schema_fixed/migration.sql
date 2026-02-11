/*
  Warnings:

  - You are about to drop the column `phase1_score` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_score` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `phase3_score` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `phase4_score` on the `Score` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Score" DROP COLUMN "phase1_score",
DROP COLUMN "phase2_score",
DROP COLUMN "phase3_score",
DROP COLUMN "phase4_score",
ADD COLUMN     "code_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "feature_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "judges_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "prediction_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "visualization_score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "answers" JSONB;

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RoundContent" (
    "id" INTEGER NOT NULL,
    "track" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "datasetPrefix" TEXT NOT NULL,
    "questions" JSONB NOT NULL,

    CONSTRAINT "RoundContent_pkey" PRIMARY KEY ("id","track")
);

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "analysis" JSONB;

-- CreateIndex
CREATE INDEX "Idea_userId_idx" ON "Idea"("userId");

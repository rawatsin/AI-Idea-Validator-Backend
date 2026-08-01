-- DropForeignKey
ALTER TABLE "Idea" DROP CONSTRAINT "Idea_userId_fkey";

-- DropIndex
DROP INDEX "Idea_userId_idx";

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

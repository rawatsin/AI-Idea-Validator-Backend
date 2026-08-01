-- CreateTable
CREATE TABLE "Idea" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "pitch" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "revenueModel" TEXT,
    "price" TEXT,
    "competitors" TEXT,
    "assumption" TEXT,
    "additionalContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

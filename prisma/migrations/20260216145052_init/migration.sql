-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('JUNIOR', 'SEMI', 'SENIOR', 'LEAD');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "remoteType" "RemoteType" NOT NULL,
    "seniority" "Seniority",
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_url_key" ON "Job"("url");

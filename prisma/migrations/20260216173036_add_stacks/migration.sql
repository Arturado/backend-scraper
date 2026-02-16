-- CreateTable
CREATE TABLE "StackTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StackTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobToStackTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobToStackTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "StackTag_name_key" ON "StackTag"("name");

-- CreateIndex
CREATE INDEX "_JobToStackTag_B_index" ON "_JobToStackTag"("B");

-- AddForeignKey
ALTER TABLE "_JobToStackTag" ADD CONSTRAINT "_JobToStackTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToStackTag" ADD CONSTRAINT "_JobToStackTag_B_fkey" FOREIGN KEY ("B") REFERENCES "StackTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ApplicationTask" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApplicationTask_applicationId_position_createdAt_idx"
    ON "ApplicationTask"("applicationId", "position", "createdAt");

ALTER TABLE "ApplicationTask"
    ADD CONSTRAINT "ApplicationTask_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

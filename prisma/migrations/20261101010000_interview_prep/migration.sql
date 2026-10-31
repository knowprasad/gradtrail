CREATE TABLE "InterviewPrepItem" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "prompt" VARCHAR(240) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewPrepItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InterviewPrepItem_applicationId_position_idx"
    ON "InterviewPrepItem"("applicationId", "position");

ALTER TABLE "InterviewPrepItem"
    ADD CONSTRAINT "InterviewPrepItem_applicationId_fkey"
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

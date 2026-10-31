ALTER TABLE "Application" ADD COLUMN "postingLinkHash" CHAR(64);

CREATE INDEX "Application_postingLinkHash_idx" ON "Application"("postingLinkHash");

ALTER TABLE "PostingSearch"
  ADD COLUMN "autoRefresh" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastAutoRefreshAt" TIMESTAMP(3),
  ADD COLUMN "newPostings" JSONB NOT NULL DEFAULT '[]'::jsonb;

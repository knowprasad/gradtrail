import "server-only";

import { logServerError } from "@/lib/log";
import { refreshDueSavedSearches } from "@/lib/posting-searches";

const EVERY_MS = 15 * 60 * 1000;
const globalForSavedSearches = globalThis as unknown as { savedSearchTimer?: ReturnType<typeof setInterval> };

/** Opt-in saved search checks run at most once a day per search. */
export function startSavedSearchSchedule(): void {
  if (globalForSavedSearches.savedSearchTimer) return;
  const check = () => void refreshDueSavedSearches().catch((error: unknown) => logServerError("saved search schedule", error));
  globalForSavedSearches.savedSearchTimer = setInterval(check, EVERY_MS);
  globalForSavedSearches.savedSearchTimer.unref?.();
  check();
}

import { createHash } from "node:crypto";

import { linkKey } from "@/lib/job-search/search";

/** Stable, indexable identity for an application URL and a job posting URL. */
export function postingLinkHash(url: string): string | null {
  const key = linkKey(url);
  return key ? createHash("sha256").update(key).digest("hex") : null;
}

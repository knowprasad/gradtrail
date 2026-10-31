import "server-only";

import { z } from "zod";

import type { JobSourceAdapter, RequestContext } from "./adapter";
import { jobSearchError } from "./errors";
import { requestJson } from "./http";
import { safeLink, searchKeywords, type FoundPosting, type SearchPage, type SearchQuery } from "./search";
import { plainText } from "./text";

// Remote OK publishes a public JSON feed. Their terms ask aggregators to
// credit Remote OK and link each result to its original Remote OK listing.
const BASE = "https://remoteok.com/api";
const maybeText = z.string().nullish().catch(null);
const jobSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  position: maybeText,
  company: maybeText,
  location: maybeText,
  description: maybeText,
  date: maybeText,
  epoch: z.coerce.number().nullish().catch(null),
  url: maybeText,
  apply_url: maybeText,
  salary_min: z.coerce.number().nullish().catch(null),
  salary_max: z.coerce.number().nullish().catch(null),
  tags: z.array(z.string()).nullish().catch([]),
});

function dateOf(job: z.output<typeof jobSchema>): string | null {
  if (job.epoch) {
    const date = new Date(job.epoch * 1000);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  if (!job.date) return null;
  const date = new Date(job.date);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function salaryOf(job: z.output<typeof jobSchema>): string {
  if (!job.salary_min && !job.salary_max) return "";
  const format = (amount: number) => `$${amount.toLocaleString("en-US")}`;
  if (job.salary_min && job.salary_max) return `${format(job.salary_min)}–${format(job.salary_max)}`;
  return job.salary_min ? `From ${format(job.salary_min)}` : `Up to ${format(job.salary_max!)}`;
}

function postingOf(job: z.output<typeof jobSchema>): FoundPosting | null {
  const title = plainText(job.position).slice(0, 500);
  const url = safeLink(job.url);
  if (!job.id || !title || !url || !/^(?:www\.)?remoteok\.com$/.test(new URL(url).hostname)) return null;
  const description = plainText(job.description).slice(0, 100_000);
  return {
    source: "REMOTEOK",
    externalId: String(job.id).slice(0, 500),
    title,
    company: plainText(job.company).slice(0, 300),
    place: plainText(job.location).slice(0, 300) || "Remote",
    remote: true,
    salary: salaryOf(job).slice(0, 200),
    postedAt: dateOf(job),
    // Always link to Remote OK's canonical listing as its public API terms ask.
    url,
    via: "",
    description,
    complete: Boolean(description),
  };
}

async function search(query: SearchQuery, _credentials: Record<string, never>, _next: string | null, context: RequestContext = {}): Promise<SearchPage> {
  const url = new URL(context.baseUrl ?? BASE);
  const tags = searchKeywords(query).toLowerCase().match(/[a-z0-9+#.-]+/g)?.slice(0, 4) ?? [];
  if (tags.length) url.searchParams.set("tags", [...new Set(tags)].join(","));
  const raw = await requestJson("REMOTEOK", url, { signal: context.signal });
  if (!Array.isArray(raw)) throw jobSearchError("changed", "REMOTEOK", { detail: "/api: unexpected answer" });
  const postings = raw.slice(1).flatMap((item) => {
    const parsed = jobSchema.safeParse(item);
    if (!parsed.success) return [];
    const posting = postingOf(parsed.data);
    return posting ? [posting] : [];
  });
  return { postings, next: null };
}

export const remoteok: JobSourceAdapter<"REMOTEOK"> = {
  source: "REMOTEOK",
  search,
  details: async (posting) => posting.complete ? posting.description : null,
  test: async (_credentials, context) => { await search({ keywords: "developer", place: "", country: "us", radiusKm: 25, remoteOnly: true, postedWithin: "any" }, {}, null, context); },
};

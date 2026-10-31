import "server-only";

import { z } from "zod";

import { fetchPosting } from "@/lib/posting-fetch";

import type { JobSourceAdapter, RequestContext, SourceCredentials } from "./adapter";
import { countryName } from "./countries";
import { jobSearchError } from "./errors";
import { requestJson } from "./http";
import { safeLink, searchKeywords, type FoundPosting, type SearchPage, type SearchQuery } from "./search";
import { plainText } from "./text";

// Jooble India REST API. Its key is embedded in the endpoint path, so all
// surfaced and logged request details use a redacted path.
const BASE = "https://in.jooble.org/api";
const PAGE_SIZE = 20;
const RADII = [0, 4, 8, 16, 26, 40, 80] as const;

const maybeText = z.string().nullish().catch(null);
const resultSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: maybeText,
  location: maybeText,
  snippet: maybeText,
  salary: maybeText,
  source: maybeText,
  type: maybeText,
  link: maybeText,
  company: maybeText,
  updated: maybeText,
});
const responseSchema = z.object({ totalCount: z.coerce.number().nullish().catch(null), jobs: z.array(z.unknown()) });

function pageOf(next: string | null): number {
  return next?.startsWith("page:") ? Math.max(1, Number(next.slice(5)) || 1) : 1;
}

function radiusOf(km: number): number {
  return [...RADII].sort((a, b) => Math.abs(a - km) - Math.abs(b - km))[0];
}

function postingFromResult(result: z.output<typeof resultSchema>): FoundPosting {
  const description = plainText(result.snippet).slice(0, 100_000);
  return {
    source: "JOOBLE",
    externalId: result.id.slice(0, 500),
    title: plainText(result.title).slice(0, 500),
    company: plainText(result.company).slice(0, 300),
    place: plainText(result.location).slice(0, 300),
    remote: null,
    salary: plainText(result.salary).slice(0, 200),
    // Jooble exposes `updated`, which is not necessarily the original posting date.
    postedAt: null,
    url: safeLink(result.link).slice(0, 2000),
    via: plainText(result.source).slice(0, 100),
    description,
    complete: false,
  };
}

function requestUrl(key: string, baseUrl?: string): URL {
  const base = (baseUrl ?? BASE).replace(/\/+$/, "");
  return new URL(`${base}/${encodeURIComponent(key)}`);
}

async function searchPage(
  query: SearchQuery,
  { key }: SourceCredentials["JOOBLE"],
  next: string | null,
  context: RequestContext = {},
): Promise<SearchPage> {
  const keywords = [searchKeywords(query), query.remoteOnly ? "remote" : ""].filter(Boolean).join(" ");
  const answer = responseSchema.safeParse(
    await requestJson("JOOBLE", requestUrl(key, context.baseUrl ? `${context.baseUrl}/api` : undefined), {
      method: "POST",
      body: {
        keywords,
        location: query.place || countryName(query.country),
        ...(query.place ? { radius: String(radiusOf(query.radiusKm)) } : {}),
        page: pageOf(next),
        ResultOnPage: PAGE_SIZE,
        companysearch: false,
      },
      signal: context.signal,
      safePath: "/api/[redacted]",
    }),
  );
  if (!answer.success) throw jobSearchError("changed", "JOOBLE", { detail: "/api/[redacted]: unexpected answer" });

  const seen = new Set<string>();
  const postings: FoundPosting[] = [];
  for (const item of answer.data.jobs) {
    const result = resultSchema.safeParse(item);
    if (!result.success || seen.has(result.data.id)) continue;
    seen.add(result.data.id);
    postings.push(postingFromResult(result.data));
  }
  const page = pageOf(next);
  const total = answer.data.totalCount ?? 0;
  return { postings, next: page * PAGE_SIZE < total && answer.data.jobs.length > 0 ? `page:${page + 1}` : null };
}

export const jooble: JobSourceAdapter<"JOOBLE"> = {
  source: "JOOBLE",
  search: searchPage,
  details: async (posting) => {
    if (!posting.url) return null;
    const page = await fetchPosting(posting.url);
    return page.ok ? page.text : null;
  },
  test: async (credentials, context) => {
    await searchPage({ keywords: "software developer", place: "Bengaluru", country: "in", radiusKm: 25, remoteOnly: false, postedWithin: "any" }, credentials, null, context);
  },
};

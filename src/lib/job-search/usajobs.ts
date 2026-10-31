import "server-only";

import { z } from "zod";

import type { JobSourceAdapter, RequestContext, SourceCredentials } from "./adapter";
import { jobSearchError } from "./errors";
import { requestJson } from "./http";
import { POSTED_WITHIN, safeLink, searchKeywords, type FoundPosting, type SearchPage, type SearchQuery } from "./search";
import { plainText } from "./text";

// Official USAJOBS public announcements. Each request identifies the email
// used to obtain the API key; neither the key nor email is put in the URL.
const BASE = "https://data.usajobs.gov/api/search";
const PAGE_SIZE = 25;
const maybeText = z.string().nullish().catch(null);
const maybeNumber = z.coerce.number().nullish().catch(null);

const resultSchema = z.object({
  MatchedObjectId: z.union([z.string(), z.number()]).transform(String),
  MatchedObjectDescriptor: z.object({
    PositionID: maybeText,
    PositionTitle: maybeText,
    PositionURI: maybeText,
    ApplyURI: z.array(z.string()).nullish().catch([]),
    PositionLocationDisplay: maybeText,
    PositionLocation: z.array(z.object({ LocationName: maybeText }).passthrough()).nullish().catch([]),
    OrganizationName: maybeText,
    RemoteIndicator: z.union([z.boolean(), z.string()]).nullish().catch(null),
    PublicationStartDate: maybeText,
    ApplicationCloseDate: maybeText,
    PositionEndDate: maybeText,
    PositionOfferingType: z.array(z.object({ Name: maybeText }).passthrough()).nullish().catch([]),
    PositionRemuneration: z.array(z.object({ MinimumRange: maybeNumber, MaximumRange: maybeNumber, RateIntervalCode: maybeText }).passthrough()).nullish().catch([]),
    PositionFormattedDescription: z.array(z.object({ Label: maybeText, LabelDescription: maybeText, Content: maybeText }).passthrough()).nullish().catch([]),
    UserArea: z.object({
      Details: z.object({
        JobSummary: maybeText,
        MajorDuties: maybeText,
        Education: maybeText,
        Requirements: maybeText,
        Evaluations: maybeText,
        HowToApply: maybeText,
        RequiredDocuments: maybeText,
        Benefits: maybeText,
        WhoMayApply: z.object({ Name: maybeText, Code: maybeText }).nullish().catch(null),
      }).passthrough().nullish().catch(null),
    }).passthrough().nullish().catch(null),
  }).passthrough(),
});

const responseSchema = z.object({
  SearchResult: z.object({
    SearchResultItems: z.array(z.unknown()),
    UserArea: z.object({ NumberOfPages: z.coerce.number().nullish().catch(null) }).passthrough().nullish().catch(null),
  }).passthrough(),
});

function dateIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function salaryOf(rows: z.output<typeof resultSchema>["MatchedObjectDescriptor"]["PositionRemuneration"]): string {
  const row = rows?.find((entry) => entry.MinimumRange !== null || entry.MaximumRange !== null);
  if (!row) return "";
  const format = (amount: number | null) => amount === null ? "" : `$${Math.round(amount).toLocaleString("en-US")}`;
  const low = format(row.MinimumRange ?? null);
  const high = format(row.MaximumRange ?? null);
  const range = low && high && low !== high ? `${low}–${high}` : low || high;
  const period = row.RateIntervalCode === "PH" ? "an hour" : row.RateIntervalCode === "PA" ? "a year" : "";
  return [range, period].filter(Boolean).join(" ").slice(0, 200);
}

function descriptionOf(descriptor: z.output<typeof resultSchema>["MatchedObjectDescriptor"]): string {
  const details = descriptor.UserArea?.Details;
  const sections: string[] = [];
  const who = plainText(details?.WhoMayApply?.Name);
  if (who) sections.push(`Who may apply: ${who}`);
  const close = dateIso(descriptor.ApplicationCloseDate ?? descriptor.PositionEndDate ?? null);
  if (close) sections.push(`Application closes: ${close.slice(0, 10)}`);
  const type = descriptor.PositionOfferingType?.map((entry) => plainText(entry.Name)).filter(Boolean).join(", ");
  if (type) sections.push(`Appointment type: ${type}`);

  const added = new Set<string>();
  for (const entry of descriptor.PositionFormattedDescription ?? []) {
    const label = plainText(entry.Label || entry.LabelDescription);
    const content = plainText(entry.Content);
    if (!content || added.has(content)) continue;
    added.add(content);
    sections.push([label, content].filter(Boolean).join("\n"));
  }
  for (const [label, value] of [
    ["Summary", details?.JobSummary],
    ["Duties", details?.MajorDuties],
    ["Education", details?.Education],
    ["Requirements", details?.Requirements],
    ["Evaluations", details?.Evaluations],
    ["How to apply", details?.HowToApply],
    ["Required documents", details?.RequiredDocuments],
    ["Benefits", details?.Benefits],
  ] as const) {
    const content = plainText(value);
    if (content && !added.has(content)) {
      added.add(content);
      sections.push(`${label}\n${content}`);
    }
  }
  return sections.join("\n\n").slice(0, 100_000);
}

export function postingFromResult(value: unknown): FoundPosting | null {
  const parsed = resultSchema.safeParse(value);
  if (!parsed.success) return null;
  const { MatchedObjectId, MatchedObjectDescriptor: row } = parsed.data;
  const place = row.PositionLocationDisplay || row.PositionLocation?.map((location) => location.LocationName).filter(Boolean).join(", ") || "";
  const remote = row.RemoteIndicator === true || (typeof row.RemoteIndicator === "string" && /^true$/i.test(row.RemoteIndicator))
    ? true
    : row.RemoteIndicator === false || (typeof row.RemoteIndicator === "string" && /^false$/i.test(row.RemoteIndicator))
      ? false
      : null;
  const description = descriptionOf(row);
  return {
    source: "USAJOBS",
    externalId: (row.PositionID || MatchedObjectId).slice(0, 500),
    title: plainText(row.PositionTitle).slice(0, 500),
    company: plainText(row.OrganizationName).slice(0, 300),
    place: plainText(place).slice(0, 300),
    remote,
    salary: salaryOf(row.PositionRemuneration),
    postedAt: dateIso(row.PublicationStartDate ?? null),
    url: safeLink(row.ApplyURI?.[0] || row.PositionURI).slice(0, 2000),
    via: "",
    description,
    complete: Boolean(description),
  };
}

function searchUrl(query: SearchQuery, next: string | null, baseUrl?: string): URL {
  const url = new URL(baseUrl ? `${baseUrl.replace(/\/+$/, "")}/api/search` : BASE);
  const keywords = searchKeywords(query);
  if (keywords) url.searchParams.set("Keyword", keywords);
  url.searchParams.set("WhoMayApply", "Public");
  url.searchParams.set("Fields", "Full");
  url.searchParams.set("ResultsPerPage", String(PAGE_SIZE));
  const page = next?.startsWith("page:") ? Math.max(1, Number(next.slice(5)) || 1) : 1;
  url.searchParams.set("Page", String(page));
  if (query.place) {
    url.searchParams.set("LocationName", query.place);
    url.searchParams.set("Radius", String(Math.round(query.radiusKm * 0.621371)));
  }
  const days = POSTED_WITHIN.find((option) => option.value === query.postedWithin)?.days;
  if (days) url.searchParams.set("DatePosted", String(days));
  if (query.remoteOnly) url.searchParams.set("RemoteIndicator", "True");
  if (query.experienceLevel === "intern" || query.experienceLevel === "fresher" || query.opportunityType === "internship" || query.opportunityType === "graduate") {
    url.searchParams.set("HiringPath", "student;graduates");
  }
  if (query.opportunityType === "part-time") url.searchParams.set("PositionScheduleTypeCode", "2");
  else if (query.opportunityType === "full-time") url.searchParams.set("PositionScheduleTypeCode", "1");
  return url;
}

async function searchPage(
  query: SearchQuery,
  credentials: SourceCredentials["USAJOBS"],
  next: string | null,
  context: RequestContext = {},
): Promise<SearchPage> {
  const url = searchUrl(query, next, context.baseUrl);
  const response = responseSchema.safeParse(await requestJson("USAJOBS", url, {
    headers: { "Authorization-Key": credentials.key, "User-Agent": credentials.email },
    signal: context.signal,
    safePath: "/api/search",
  }));
  if (!response.success) throw jobSearchError("changed", "USAJOBS", { detail: "/api/search: unexpected answer" });

  const postings = response.data.SearchResult.SearchResultItems
    .map(postingFromResult)
    .filter((posting): posting is FoundPosting => posting !== null && Boolean(posting.title && posting.url));
  const page = next?.startsWith("page:") ? Math.max(1, Number(next.slice(5)) || 1) : 1;
  const pages = response.data.SearchResult.UserArea?.NumberOfPages ?? 0;
  return { postings, next: page < pages && postings.length > 0 ? `page:${page + 1}` : null };
}

export const usajobs: JobSourceAdapter<"USAJOBS"> = {
  source: "USAJOBS",
  search: searchPage,
  details: async (posting) => posting.description || null,
  test: async (credentials, context) => {
    await searchPage({ keywords: "software developer", place: "", country: "us", radiusKm: 25, remoteOnly: false, postedWithin: "any" }, credentials, null, context);
  },
};

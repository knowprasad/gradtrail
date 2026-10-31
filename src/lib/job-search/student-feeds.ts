import "server-only";

import { z } from "zod";

import type { JobSourceAdapter, RequestContext } from "./adapter";
import { jobSearchError } from "./errors";
import { requestJson } from "./http";
import { linkKey, safeLink, type FoundPosting, type SearchPage, type SearchQuery } from "./search";

const FRESHERFLOW_URL = "https://raw.githubusercontent.com/FresherFlow/India-Jobs-Internships/main/data/jobs.json";
const INTERNSCAN_URL = "https://raw.githubusercontent.com/vishnunandan555/internscan/main/data/jobs.json";
const maybeText = z.string().nullish().catch(null);
const maybeStrings = z.array(z.string()).nullish().catch([]);
const maybeYears = z.array(z.coerce.number().int()).nullish().catch(null);
const idValue = z.union([z.string(), z.number()]).transform(String);

const fresherFlowFeed = z.object({ jobs: z.array(z.unknown()).or(z.record(z.string(), z.unknown()).transform((value) => Object.values(value))) });
const fresherFlowJob = z.object({
  id: idValue.optional(),
  company: maybeText,
  title: maybeText,
  type: maybeText,
  status: maybeText,
  locations: maybeStrings,
  workMode: maybeText,
  applyLink: maybeText,
  dateAdded: maybeText,
  addedAt: maybeText,
  tags: maybeStrings,
  notesHighlights: maybeText,
  salary: maybeText,
  allowedPassoutYears: maybeYears,
});

const internScanJob = z.object({
  active: z.boolean(),
  category: maybeText,
  city_tag: maybeText,
  company: maybeText,
  country: maybeText,
  external_id: maybeText,
  first_seen: maybeText,
  locations: maybeStrings,
  posted: maybeText,
  title: maybeText,
  url: maybeText,
});
const internScanFeed = z.object({ jobs: z.record(z.string(), internScanJob) });

const TECH_ROLE = /\b(software|swe|developer|engineering|engineer|sde|data|machine learning|\bai\b|\bml\b|cloud|devops|cyber|security|systems|embedded|firmware|quality assurance|\bqa\b|technology|technical|research|frontend|front.end|backend|back.end|full.?stack|product analyst|product engineer|product manager|it intern)\b/i;
const NON_TECH_ROLE = /\b(sales|marketing|human resources|\bhr\b|content writer|business development|collection officer|actuarial|risk consultant|customer support|operations support|recruiter|account executive)\b/i;
const INTERN = /\b(intern(ship)?|co.?op|summer intern)\b/i;
const APPRENTICE = /\b(apprentice(ship)?|trainee)\b/i;
const GRADUATE = /\b(graduate|fresher|new grad|entry.level|campus hire|campus recruitment|early careers|management trainee|associate engineer|associate software)\b/i;
const REMOTE = /\b(remote|work from home|work from anywhere)\b/i;
const EUROPE_COUNTRIES = new Set(["at", "be", "bg", "ch", "cy", "cz", "de", "dk", "ee", "es", "fi", "fr", "gr", "hr", "hu", "ie", "is", "it", "li", "lt", "lu", "lv", "mt", "nl", "no", "pl", "pt", "ro", "se", "si", "sk"]);
const STOP_WORDS = new Set(["a", "an", "and", "at", "for", "in", "of", "or", "the", "to"]);

function cleanDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalized(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/bengaluru/g, "bangalore").replace(/gurugram/g, "gurgaon").replace(/[^a-z0-9+#]+/g, " ").trim();
}

function techRole(text: string, category = ""): boolean {
  if (NON_TECH_ROLE.test(text)) return false;
  return TECH_ROLE.test(text) || /\b(software|ai\/ml|data|security|hardware|technology|engineering)\b/i.test(category);
}

function remoteOf(workMode: string | null, locations: string[]): boolean | null {
  const value = [workMode, ...locations].filter(Boolean).join(" ");
  if (REMOTE.test(value)) return true;
  if (/\b(onsite|on.site|hybrid)\b/i.test(value)) return false;
  return null;
}

function countryMatches(feedCountry: string, requestedCountry: string): boolean {
  if (feedCountry === requestedCountry || feedCountry === "remote") return true;
  return feedCountry === "eu" && EUROPE_COUNTRIES.has(requestedCountry);
}

function fresherFlowPosting(value: unknown): FoundPosting | null {
  const parsed = fresherFlowJob.safeParse(value);
  if (!parsed.success) return null;
  const row = parsed.data;
  const title = row.title?.trim() ?? "";
  const company = row.company?.trim() ?? "";
  const url = safeLink(row.applyLink);
  const text = [title, company, row.notesHighlights, ...(row.tags ?? [])].filter(Boolean).join(" ");
  if (row.status?.toUpperCase() !== "PUBLISHED" || !title || !company || !url || !techRole(text)) return null;
  const locations = row.locations ?? [];
  const added = cleanDate(row.dateAdded ?? null);
  return {
    source: "STUDENT_FEEDS",
    externalId: `fresherflow:${row.id ?? url}`.slice(0, 500),
    title: title.slice(0, 500),
    company: company.slice(0, 300),
    place: locations.join(", ").slice(0, 300) || "India",
    remote: remoteOf(row.workMode ?? null, locations),
    salary: (row.salary ?? "").slice(0, 200),
    // FresherFlow's dateAdded is when its curator added the record, not the
    // employer's posting date. Keep the distinction visible in `via`.
    postedAt: null,
    url,
    via: `FresherFlow${added ? ` · added ${added.slice(0, 10)}` : ""}`.slice(0, 100),
    description: (row.notesHighlights ?? "").slice(0, 100_000),
    complete: false,
  };
}

function internScanPosting(key: string, row: z.output<typeof internScanJob>, requestedCountry: string): FoundPosting | null {
  const title = row.title?.trim() ?? "";
  const company = row.company?.trim() ?? "";
  const url = safeLink(row.url);
  const text = [title, company, row.category].filter(Boolean).join(" ");
  const rowCountry = (row.country ?? "").toLowerCase();
  if (!row.active || !countryMatches(rowCountry, requestedCountry) || !title || !company || !url || !techRole(text, row.category ?? "")) return null;
  const locations = row.locations ?? [];
  const posted = cleanDate(row.posted);
  const firstSeen = cleanDate(row.first_seen);
  return {
    source: "STUDENT_FEEDS",
    externalId: `internscan:${row.external_id || key}`.slice(0, 500),
    title: title.slice(0, 500),
    company: company.slice(0, 300),
    place: locations.join(", ").slice(0, 300) || row.city_tag || "India",
    remote: remoteOf(rowCountry === "remote" ? "remote" : null, locations),
    salary: "",
    postedAt: posted,
    url,
    via: `InternScan${firstSeen ? ` · first seen ${firstSeen.slice(0, 10)}` : ""}${rowCountry === "remote" ? " · worldwide remote" : ""}`.slice(0, 100),
    description: "",
    complete: false,
  };
}

function matchesQuery(posting: FoundPosting, query: SearchQuery, allowedYears?: number[] | null, sourceType?: string | null): boolean {
  const searchable = normalized([posting.title, posting.company, posting.description, posting.via, posting.salary].join(" "));
  const terms = normalized(query.keywords).split(/\s+/).filter((term) => term.length > 1 && !STOP_WORDS.has(term));
  if (terms.some((term) => !searchable.includes(term))) return false;

  const place = normalized(query.place);
  if (place && !normalized(posting.place).includes(place)) return false;
  if (query.remoteOnly && posting.remote !== true) return false;

  const isInternship = sourceType?.toUpperCase() === "INTERNSHIP" || INTERN.test(posting.title);
  const isApprenticeship = APPRENTICE.test(posting.title);
  const isGraduate = Boolean(allowedYears?.length) || GRADUATE.test(posting.title);
  if ((query.opportunityType === "internship" || query.experienceLevel === "intern") && !isInternship) return false;
  if (query.opportunityType === "apprenticeship" && !isApprenticeship) return false;
  if (query.opportunityType === "graduate" && !isGraduate) return false;
  if (query.opportunityType === "part-time" && !/\bpart.time\b/i.test(posting.title)) return false;
  if (query.opportunityType === "full-time" && isInternship) return false;
  if (query.experienceLevel === "fresher" && !isGraduate) return false;
  if (query.experienceLevel === "junior" && !/\b(junior|entry.level|associate|graduate|fresher|trainee)\b/i.test(posting.title)) return false;
  if (query.experienceLevel === "mid" && !/\b(mid.level|3\+? years|4\+? years)\b/i.test(posting.title)) return false;
  if (query.experienceLevel === "senior" && !/\b(senior|staff|principal|lead)\b/i.test(posting.title)) return false;
  if (query.graduationYear && allowedYears?.length && !allowedYears.includes(query.graduationYear)) return false;
  if (query.graduationYear && !allowedYears?.length) {
    const years = posting.title.match(/\b20\d{2}\b/g)?.map(Number) ?? [];
    if (years.length && !years.includes(query.graduationYear)) return false;
  }
  if (query.compensation === "paid" && !/\b(paid|stipend|salary|inr|lpa|per month)\b|₹/i.test(searchable)) return false;
  if (query.compensation === "unpaid" && !/\bunpaid\b/i.test(searchable)) return false;
  const durationText = `${posting.title} ${posting.description}`;
  if (query.internshipDuration === "1-3-months" && !/\b(one|two|three|1|2|3)[ -]?(months?|mos?|weeks?)\b/i.test(durationText)) return false;
  if (query.internshipDuration === "3-6-months" && !/\b(three|four|five|six|3|4|5|6)[ -]?(months?|mos?)\b/i.test(durationText)) return false;
  if (query.internshipDuration === "6-plus-months" && !/\b([6-9]|1[0-2]|six|seven|eight|nine|ten|eleven|twelve)[ -]?(months?|mos?)\b/i.test(durationText)) return false;

  const days = { day: 1, "3days": 3, week: 7, month: 30 }[query.postedWithin as "day" | "3days" | "week" | "month"];
  if (days) {
    if (!posting.postedAt) return false;
    const age = Date.now() - new Date(posting.postedAt).getTime();
    if (age < 0 || age > days * 86_400_000) return false;
  }
  return true;
}

function endpoint(context: RequestContext, feed: "fresherflow" | "internscan", url: string): URL {
  return context.baseUrl ? new URL(feed, `${context.baseUrl.replace(/\/+$/, "")}/`) : new URL(url);
}

async function search(query: SearchQuery, _credentials: Record<string, never>, _next: string | null, context: RequestContext = {}): Promise<SearchPage> {
  const [fresherRaw, internRaw] = await Promise.all([
    query.country === "in"
      ? requestJson("STUDENT_FEEDS", endpoint(context, "fresherflow", FRESHERFLOW_URL), { signal: context.signal, safePath: "/fresherflow/data/jobs.json" })
      : Promise.resolve({ jobs: [] }),
    requestJson("STUDENT_FEEDS", endpoint(context, "internscan", INTERNSCAN_URL), { signal: context.signal, safePath: "/internscan/data/jobs.json" }),
  ]);
  const fresherFeed = fresherFlowFeed.safeParse(fresherRaw);
  const internFeed = internScanFeed.safeParse(internRaw);
  if (!fresherFeed.success) throw jobSearchError("changed", "STUDENT_FEEDS", { detail: "FresherFlow feed shape changed" });
  if (!internFeed.success) throw jobSearchError("changed", "STUDENT_FEEDS", { detail: "InternScan feed shape changed" });

  const fresherRows = fresherFeed.data.jobs.flatMap((row) => {
    const parsed = fresherFlowJob.safeParse(row);
    if (!parsed.success) return [];
    const posting = fresherFlowPosting(parsed.data);
    return posting && matchesQuery(posting, query, parsed.data.allowedPassoutYears, parsed.data.type) ? [posting] : [];
  });
  const internRows = Object.entries(internFeed.data.jobs).flatMap(([key, row]) => {
    const posting = internScanPosting(key, row, query.country);
    return posting && matchesQuery(posting, query) ? [posting] : [];
  });

  // Keep one result for listings shared by both feeds; prefer the one with an
  // employer-published date when the links identify the same posting.
  const unique = new Map<string, FoundPosting>();
  for (const posting of [...fresherRows, ...internRows]) {
    const key = linkKey(posting.url) || `${normalized(posting.company)}:${normalized(posting.title)}`;
    const existing = unique.get(key);
    if (!existing || (!existing.postedAt && posting.postedAt)) unique.set(key, posting);
  }
  const postings = [...unique.values()].sort((a, b) => {
    if (a.postedAt && b.postedAt) return b.postedAt.localeCompare(a.postedAt);
    if (a.postedAt) return -1;
    if (b.postedAt) return 1;
    return a.company.localeCompare(b.company) || a.title.localeCompare(b.title);
  });
  return { postings, next: null };
}

export const studentFeeds: JobSourceAdapter<"STUDENT_FEEDS"> = {
  source: "STUDENT_FEEDS",
  search,
  details: async (posting) => posting.complete ? posting.description : null,
  test: async (_credentials, context) => {
    await search({ keywords: "", place: "", country: "us", radiusKm: 25, remoteOnly: false, postedWithin: "any" }, {}, null, context);
  },
};

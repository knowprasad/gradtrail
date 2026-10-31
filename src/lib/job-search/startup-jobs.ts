import "server-only";

import type { JobSourceAdapter, RequestContext } from "./adapter";
import { jobSearchError } from "./errors";
import { requestText } from "./http";
import { countryName } from "./countries";
import { safeLink, type FoundPosting, type SearchPage, type SearchQuery } from "./search";
import { plainText } from "./text";

const FEED = "https://startup.jobs/feeds/jobs";
const MAX_RESULTS = 50;

function tag(xml: string, name: string): string {
  const value = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}\\s*>`, "i").exec(xml)?.[1] ?? "";
  return plainText(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
}

function descriptionText(xml: string): string {
  const value = (/<description(?:\s[^>]*)?>([\s\S]*?)<\/description\s*>/i.exec(xml)?.[1] ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;br\s*\/??&gt;/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&lt;\/p&gt;/gi, "\n")
    .replace(/<\/p>/gi, "\n");
  return value.split(/\r?\n/).map((line) => plainText(line)).filter(Boolean).join("\n").slice(0, 100_000);
}

function dateOf(value: string): string | null {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function postingOf(xml: string): FoundPosting | null {
  const title = tag(xml, "title");
  const split = /^(.*?)\s+at\s+(.+)$/i.exec(title);
  const role = split?.[1]?.trim() ?? title;
  const company = split?.[2]?.trim() ?? "";
  const link = safeLink(tag(xml, "guid")) || safeLink(tag(xml, "link"));
  if (!title || !company || !link || new URL(link).hostname !== "startup.jobs") return null;

  const description = descriptionText(xml);
  const lines = description.split("\n");
  const footer = lines.at(-1) ?? "";
  const salary = /(?:[$€£₹]\s?[\d,.]+(?:\s?[kK])?(?:\s*[–—-]\s*(?:[$€£₹]\s?)?[\d,.]+(?:\s?[kK])?)?(?:\s*(?:per\s+(?:year|month|hour)|annually|\/\s*(?:yr|year|mo|month)))?|\b(?:USD|EUR|GBP|INR|CAD|AUD)\s?[\d,.]+(?:\s*[–—-]\s?[\d,.]+)?(?:\s*(?:per\s+(?:year|month|hour)|annually))?)/i.exec(footer)?.[0] ?? "";
  const place = (salary ? footer.slice(0, footer.indexOf(salary)) : footer).replace(/[·|,\s]+$/, "").trim();
  const remote = /\b(remote|work from anywhere|anywhere in the world|worldwide)\b/i.test(`${title} ${footer}`)
    ? true
    : /\b(on.site|in.office)\b/i.test(`${title} ${footer}`)
      ? false
      : null;
  const published = dateOf(tag(xml, "pubDate"));
  const body = lines.slice(0, salary || place !== footer ? -1 : undefined).join("\n").trim();

  return {
    source: "STARTUP_JOBS",
    externalId: link.slice(0, 500),
    title: role.slice(0, 500),
    company: company.slice(0, 300),
    place: place.slice(0, 300),
    remote,
    salary: salary.slice(0, 200),
    postedAt: published,
    url: link,
    via: "Startup.jobs",
    description: body.slice(0, 100_000),
    complete: Boolean(body),
  };
}

const WORDS: Record<string, RegExp> = {
  intern: /\b(intern(ship)?|co.?op)\b/i,
  fresher: /\b(graduate|fresher|entry.level|early career|trainee)\b/i,
  junior: /\b(junior|entry.level|associate|graduate|trainee)\b/i,
  mid: /\b(mid.level|3\+? years|4\+? years)\b/i,
  senior: /\b(senior|staff|principal|lead)\b/i,
};

function matches(posting: FoundPosting, query: SearchQuery): boolean {
  const text = `${posting.title} ${posting.company} ${posting.place} ${posting.description} ${posting.salary}`.toLowerCase();
  const terms = query.keywords.toLowerCase().split(/\s+/).filter((word) => word.length > 1);
  if (terms.some((word) => !text.includes(word))) return false;
  if (query.place && !posting.place.toLowerCase().includes(query.place.toLowerCase())) return false;
  if (query.remoteOnly && posting.remote !== true) return false;
  if (query.country && posting.remote !== true) {
    const country = countryName(query.country).toLowerCase();
    const place = posting.place.toLowerCase().replace(/\bu\.s\.\b/g, "united states").replace(/\bu\.k\.\b/g, "united kingdom");
    if (place && !place.includes(country)) return false;
  }
  if ((query.experienceLevel === "intern" || query.opportunityType === "internship") && !WORDS.intern.test(posting.title)) return false;
  if (query.experienceLevel && query.experienceLevel !== "any" && !WORDS[query.experienceLevel]?.test(posting.title)) return false;
  if (query.opportunityType === "apprenticeship" && !/\b(apprentice|apprenticeship)\b/i.test(posting.title)) return false;
  if (query.opportunityType === "graduate" && !WORDS.fresher.test(posting.title)) return false;
  if (query.compensation === "paid" && !posting.salary && !/\b(paid|stipend|salary)\b/i.test(text)) return false;
  if (query.compensation === "unpaid" && !/\bunpaid\b/i.test(text)) return false;
  const duration = `${posting.title} ${posting.description}`;
  if (query.internshipDuration === "1-3-months" && !/\b(one|two|three|1|2|3)[ -]?(months?|mos?)\b/i.test(duration)) return false;
  if (query.internshipDuration === "3-6-months" && !/\b(three|four|five|six|3|4|5|6)[ -]?(months?|mos?)\b/i.test(duration)) return false;
  if (query.internshipDuration === "6-plus-months" && !/\b([6-9]|1[0-2]|six|seven|eight|nine|ten|eleven|twelve)[ -]?(months?|mos?)\b/i.test(duration)) return false;
  if (query.postedWithin !== "any") {
    const days = { day: 1, "3days": 3, week: 7, month: 30 }[query.postedWithin];
    if (!posting.postedAt || Date.now() - new Date(posting.postedAt).getTime() > days * 86_400_000) return false;
  }
  return true;
}

async function search(query: SearchQuery, _credentials: Record<string, never>, _next: string | null, context: RequestContext = {}): Promise<SearchPage> {
  const url = context.baseUrl
    ? new URL(`${context.baseUrl.replace(/\/+$/, "")}/feeds/jobs`)
    : new URL(FEED);
  if (query.keywords.trim()) url.searchParams.set("role", query.keywords.trim().slice(0, 80));
  if (query.remoteOnly) url.searchParams.set("workplace", "remote");
  const xml = await requestText("STARTUP_JOBS", url, {
    headers: { accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5" },
    signal: context.signal,
    safePath: "/feeds/jobs",
  });
  if (!/<rss\b/i.test(xml) || !/<channel\b/i.test(xml)) throw jobSearchError("changed", "STARTUP_JOBS", { detail: "/feeds/jobs: unexpected RSS document" });
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item\s*>/gi)].slice(0, MAX_RESULTS);
  const postings = items.flatMap((match) => {
    const posting = postingOf(match[1]);
    return posting && matches(posting, query) ? [posting] : [];
  });
  return { postings, next: null };
}

export const startupJobs: JobSourceAdapter<"STARTUP_JOBS"> = {
  source: "STARTUP_JOBS",
  search,
  details: async (posting) => posting.complete ? posting.description : null,
  test: async (_credentials, context) => {
    await search({ keywords: "software engineer", place: "", country: "us", radiusKm: 25, remoteOnly: false, postedWithin: "any" }, {}, null, context);
  },
};

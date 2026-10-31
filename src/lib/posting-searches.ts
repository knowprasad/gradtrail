import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { daysBetween, formatDay, formatTime } from "@/lib/dates";
import { askSource } from "@/lib/job-search/find";
import {
  EMPTY_QUERY,
  foundPostingSchema,
  postingKey,
  searchQuerySchema,
  type FoundPosting,
  type PastSearchDay,
  type SearchProblem,
  type SearchQuery,
  type ShownPosting,
  type StoredSearch,
} from "@/lib/job-search/search";
import { postingStates } from "@/lib/postings";
import { prisma } from "@/lib/prisma";

const AUTO_REFRESH_MAX = 5;
const AUTO_REFRESH_MS = 24 * 60 * 60 * 1000;

// Searches kept with what they found (E14-10), until the user removes them,
// so going back to one costs no searches from the source's plan.

/** The postings column, read back; a posting that no longer fits the shape is left out. */
function postingsOf(value: Prisma.JsonValue): FoundPosting[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const posting = foundPostingSchema.safeParse(item);
    return posting.success ? [posting.data] : [];
  });
}

const queryOf = (value: Prisma.JsonValue): SearchQuery => searchQuerySchema.catch(EMPTY_QUERY).parse(value);

/** Postings with where each stands for the user now. */
async function withStates(postings: FoundPosting[]): Promise<ShownPosting[]> {
  const states = await postingStates(postings);
  return postings.map((posting) => ({ ...posting, state: states.get(postingKey(posting))! }));
}

/** "today at 14:32", "yesterday at 09:05" or "on Thu 1 Oct at 18:20". */
function ranAtLabel(date: Date, timeZone?: string, now = new Date()): string {
  const days = daysBetween(date, now, timeZone);
  const day = days === 0 ? "today" : days === 1 ? "yesterday" : `on ${formatDay(date, timeZone, now)}`;
  return `${day} at ${formatTime(date, timeZone)}`;
}

/** Runs a search on the chosen source and keeps it with its first page. */
export async function runSearch(query: SearchQuery): Promise<{ ok: true; id: string } | SearchProblem> {
  const answer = await askSource(query);
  if (!answer.ok) return answer;
  const search = await prisma.postingSearch.create({
    data: {
      source: answer.source,
      query,
      postings: answer.postings,
      found: answer.postings.length,
      next: answer.next,
      seen: answer.postings.map(postingKey),
    },
    select: { id: true },
  });
  return { ok: true, id: search.id };
}

/** A saved query refreshes its first page and reports which postings are new since its last refresh. */
export async function refreshSavedSearch(id: string): Promise<{ ok: true; id: string; added: number } | SearchProblem> {
  const previous = await prisma.postingSearch.findUnique({ where: { id }, select: { id: true, saved: true, source: true, query: true, postings: true, seen: true, newPostings: true } });
  if (!previous?.saved) return { ok: false, problem: "changed", message: "That saved search is no longer available." };
  // A manual refresh should ask the provider again; ordinary revisits stay cached.
  const answer = await askSource(queryOf(previous.query), { source: previous.source, fresh: true });
  if (!answer.ok) return answer;
  const seen = new Set<string>([
    ...(Array.isArray(previous.seen) ? previous.seen.filter((value): value is string => typeof value === "string") : []),
    ...postingsOf(previous.postings).map(postingKey),
  ]);
  const unread = Array.isArray(previous.newPostings) ? previous.newPostings.filter((value): value is string => typeof value === "string") : [];
  const nextUnread = new Set(unread);
  let added = 0;
  for (const posting of answer.postings) {
    const key = postingKey(posting);
    if (seen.has(key)) continue;
    if (!nextUnread.has(key)) added += 1;
    nextUnread.add(key);
  }
  // Keep new keys as unseen until the next refresh so the screen continues to
  // show the new count between checks, even though its displayed page updates.
  await prisma.postingSearch.update({
    where: { id },
    data: { postings: answer.postings, found: answer.postings.length, next: answer.next, seen: [...seen], newPostings: [...nextUnread] },
  });
  return { ok: true, id, added };
}

/** Save or unsave a past search for user-triggered refreshes. */
export async function setSearchSaved(id: string, saved: boolean): Promise<boolean> {
  const search = await prisma.postingSearch.findUnique({ where: { id }, select: { id: true, saved: true, seen: true, postings: true } });
  if (!search) return false;
  await prisma.postingSearch.update({
    where: { id },
    data: {
      saved,
      ...(!saved ? { autoRefresh: false } : {}),
      ...(!search.saved && saved
        ? {
            seen: Array.isArray(search.seen) && search.seen.length
              ? search.seen
              : postingsOf(search.postings).map(postingKey),
          }
        : {}),
    },
  });
  return true;
}

/** One daily provider request per enabled query, with an explicit five-query ceiling. */
export async function setSearchAutoRefresh(id: string, enabled: boolean): Promise<{ ok: true } | { ok: false; reason: "missing" | "limit" | "quota" }> {
  const search = await prisma.postingSearch.findUnique({ where: { id }, select: { id: true, saved: true, source: true } });
  if (!search?.saved) return { ok: false, reason: "missing" };
  if (enabled && search.source === "JOOBLE") return { ok: false, reason: "quota" };
  if (enabled && (await prisma.postingSearch.count({ where: { saved: true, autoRefresh: true } })) >= AUTO_REFRESH_MAX) return { ok: false, reason: "limit" };
  await prisma.postingSearch.update({ where: { id }, data: { autoRefresh: enabled } });
  return { ok: true };
}

/** Keep new-post alerts until a person acknowledges them. */
export async function markSavedSearchAlertsSeen(id: string): Promise<boolean> {
  const search = await prisma.postingSearch.findUnique({ where: { id }, select: { seen: true, newPostings: true } });
  if (!search) return false;
  const seen = new Set([
    ...(Array.isArray(search.seen) ? search.seen.filter((value): value is string => typeof value === "string") : []),
    ...(Array.isArray(search.newPostings) ? search.newPostings.filter((value): value is string => typeof value === "string") : []),
  ]);
  await prisma.postingSearch.update({ where: { id }, data: { seen: [...seen], newPostings: [] } });
  return true;
}

/** Claim and refresh opted-in searches once per rolling day. */
export async function refreshDueSavedSearches(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - AUTO_REFRESH_MS);
  const due = await prisma.postingSearch.findMany({
    where: { saved: true, autoRefresh: true, OR: [{ lastAutoRefreshAt: null }, { lastAutoRefreshAt: { lt: cutoff } }] },
    select: { id: true, lastAutoRefreshAt: true },
    orderBy: { lastAutoRefreshAt: "asc" },
    take: AUTO_REFRESH_MAX,
  });
  let checked = 0;
  for (const search of due) {
    const claimed = await prisma.postingSearch.updateMany({
      where: { id: search.id, saved: true, autoRefresh: true, lastAutoRefreshAt: search.lastAutoRefreshAt },
      data: { lastAutoRefreshAt: now },
    });
    if (!claimed.count) continue;
    try {
      const result = await refreshSavedSearch(search.id);
      if (result.ok) checked += 1;
      else {
        const { logServerError } = await import("@/lib/log");
        logServerError(`saved search auto-refresh ${search.id}`, result.message);
      }
    } catch (error) {
      const { logServerError } = await import("@/lib/log");
      logServerError(`saved search auto-refresh ${search.id}`, error);
    }
  }
  return checked;
}

/** Number of new posting alerts, retained until marked seen. */
export async function countUnseenSavedSearchPostings(): Promise<number> {
  const rows = await prisma.postingSearch.findMany({ where: { saved: true }, select: { newPostings: true } });
  return rows.reduce((total, row) => total + (Array.isArray(row.newPostings) ? row.newPostings.length : 0), 0);
}

/** A kept search, the latest one without an id; null when there's none. */
export async function loadSearch(id?: string, { timeZone, now = new Date() }: { timeZone?: string; now?: Date } = {}): Promise<StoredSearch | null> {
  const search = id
    ? await prisma.postingSearch.findUnique({ where: { id } })
    : await prisma.postingSearch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!search) return null;
  return {
    id: search.id,
    source: search.source,
    query: queryOf(search.query),
    ranAt: ranAtLabel(search.createdAt, timeZone, now),
    postings: await withStates(postingsOf(search.postings)),
    next: search.next,
  };
}

/** "Show more": the next page from the search's own source, added to the kept search. */
export async function showMoreFor(id: string): Promise<{ ok: true; postings: ShownPosting[]; next: string | null } | SearchProblem> {
  const search = await prisma.postingSearch.findUnique({ where: { id } });
  if (!search) return { ok: false, problem: "changed", message: "That search is no longer kept. Search again." };
  if (!search.next) return { ok: true, postings: [], next: null };
  const answer = await askSource(queryOf(search.query), { source: search.source, next: search.next });
  if (!answer.ok) return answer;
  const kept = postingsOf(search.postings);
  const seen = new Set(kept.map(postingKey));
  const added = answer.postings.filter((posting) => !seen.has(postingKey(posting)));
  const postings = [...kept, ...added];
  await prisma.postingSearch.update({ where: { id }, data: { postings, found: postings.length, next: answer.next } });
  return { ok: true, postings: await withStates(added), next: answer.next };
}

/** Every kept search, newest first, grouped by the day it ran in the user's time zone. */
export async function listSearches({ timeZone, now = new Date(), savedOnly = false }: { timeZone?: string; now?: Date; savedOnly?: boolean } = {}): Promise<PastSearchDay[]> {
  const searches = await prisma.postingSearch.findMany({
    where: savedOnly ? { saved: true } : undefined,
    select: { id: true, source: true, query: true, found: true, createdAt: true, saved: true, seen: true, postings: true, autoRefresh: true, lastAutoRefreshAt: true, newPostings: true },
    orderBy: { createdAt: "desc" },
  });
  const days: PastSearchDay[] = [];
  for (const search of searches) {
    const ago = daysBetween(search.createdAt, now, timeZone);
    const day = ago === 0 ? "Today" : ago === 1 ? "Yesterday" : formatDay(search.createdAt, timeZone, now);
    if (days.at(-1)?.day !== day) days.push({ day, searches: [] });
    const seen = new Set(Array.isArray(search.seen) ? search.seen.filter((value): value is string => typeof value === "string") : []);
    const postings = postingsOf(search.postings);
    const newPostings = Array.isArray(search.newPostings) ? search.newPostings.length : search.saved ? postings.filter((posting) => !seen.has(postingKey(posting))).length : 0;
    days.at(-1)!.searches.push({ id: search.id, source: search.source, query: queryOf(search.query), found: search.found, time: formatTime(search.createdAt, timeZone), saved: search.saved, added: newPostings, autoRefresh: search.autoRefresh, lastAutoRefreshAt: search.lastAutoRefreshAt?.toISOString() ?? null });
  }
  return days;
}

export const countAllSearches = () => prisma.postingSearch.count();
export const countSavedSearches = () => prisma.postingSearch.count({ where: { saved: true } });
export const countPastSearches = () => prisma.postingSearch.count({ where: { saved: false } });

export async function removeSearch(id: string): Promise<void> {
  await prisma.postingSearch.deleteMany({ where: { id } });
}

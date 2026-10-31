"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast, toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";
import type { Country } from "@/lib/job-search/countries";
import { describeSearch, searchRunHref, type PastSearchDay } from "@/lib/job-search/search";
import { SOURCE_INFO } from "@/lib/job-search/sources";

import { markSavedJobSearchAlertsSeen, refreshSavedJobSearch, saveJobSearch, setSavedJobSearchAutoRefresh } from "./actions";

/** Saved queries, refreshed only on request so self-hosted installs need no background scheduler. */
export function SavedSearches({ days = [], countries }: { days?: PastSearchDay[]; countries: readonly Country[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
  const countryName = (code: string) => countries.find((country) => country.code === code)?.name ?? code.toUpperCase();

  const refresh = async (id: string) => {
    setBusy((current) => new Set(current).add(id));
    try {
      const result = toastResult(await refreshSavedJobSearch({ id }));
      if (result.ok) {
        toast(result.data.added ? `Found ${result.data.added} new ${result.data.added === 1 ? "posting" : "postings"}.` : "No new postings since the last refresh.");
        router.refresh();
      }
    } finally {
      setBusy((current) => { const next = new Set(current); next.delete(id); return next; });
    }
  };

  const unsave = async (id: string) => {
    const result = toastResult(await saveJobSearch({ id, saved: false }));
    if (result.ok) router.refresh();
  };

  const toggleAuto = async (id: string, enabled: boolean) => {
    const result = toastResult(await setSavedJobSearchAutoRefresh({ id, enabled }));
    if (result.ok) {
      toast(enabled ? "Daily checks enabled. Each check uses a request from the selected job source." : "Daily checks paused.");
      router.refresh();
    }
  };

  const markSeen = async (id: string) => {
    const result = toastResult(await markSavedJobSearchAlertsSeen({ id }));
    if (result.ok) {
      toast("New postings marked as seen.");
      router.refresh();
    }
  };

  if (days.length === 0) return <div className="mx-4 mb-16 max-w-[860px] rounded-panel border border-line-card bg-card px-5 py-9 text-center text-sm text-muted sm:mx-10">No saved searches yet. Build a search and choose Save search. You can then refresh it yourself or opt into a daily check for new postings.</div>;
  return (
    <div className="flex max-w-[900px] flex-col gap-6 px-4 pb-16 sm:px-10">
      <p className="text-meta text-muted">Daily checks are optional and off by default. Each enabled search uses up to one source request per day; enable them only if your source’s quota allows it. You can enable up to five. Jooble is excluded because its key has a lifetime request limit. New-post alerts stay until you mark them seen.</p>
      {days.map((day) => <section key={day.day} aria-label={day.day} className="flex flex-col gap-2">
        <h2 className="text-label font-medium text-muted">{day.day}</h2>
        <ul className="flex flex-col gap-2">{day.searches.map((search) => {
          const what = describeSearch(search.query, countryName(search.query.country), search.source);
          return <li key={search.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-card bg-card px-4 py-3">
            <Link href={searchRunHref(search.id)} className="flex min-w-0 flex-1 flex-col gap-0.5 text-ink hover:text-ink">
              <span className="truncate text-field font-medium">{what}</span>
              <span className="text-meta text-muted">{search.found} postings · {SOURCE_INFO[search.source].name} · {search.added > 0 ? `${search.added} new to review` : `last searched ${search.time}`}{search.autoRefresh ? ` · daily check on${search.lastAutoRefreshAt ? ` · checked ${new Date(search.lastAutoRefreshAt).toLocaleDateString()}` : " · first check is pending"}` : ""}</span>
            </Link>
            <div className="flex gap-2">
              {search.added > 0 && <Button variant="text" size="sm" onClick={() => void markSeen(search.id)}>Mark new posts seen</Button>}
              <Button variant="secondary" size="sm" onClick={() => void toggleAuto(search.id, !search.autoRefresh)}>{search.autoRefresh ? "Pause daily check" : "Enable daily check"}</Button>
              <Button variant="secondary" size="sm" disabled={busy.has(search.id)} onClick={() => void refresh(search.id)}>{busy.has(search.id) ? "Checking…" : "Check for new posts"}</Button>
              <Button variant="text" size="sm" onClick={() => void unsave(search.id)}>Remove</Button>
            </div>
          </li>;
        })}</ul>
      </section>)}
    </div>
  );
}

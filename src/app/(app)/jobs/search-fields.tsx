"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Country } from "@/lib/job-search/countries";
import { EXPERIENCE_LEVELS, OPPORTUNITY_TYPES, POSTED_WITHIN, RADII_KM, type JobSource, type RadiusKm, type SearchQuery } from "@/lib/job-search/search";
import { SOURCE_INFO, sourceCovers } from "@/lib/job-search/sources";

// A search's fields, as Find jobs asks them (E14-6) and Settings → Job agent
// saves its search (E16-7).

export type SearchFieldErrors = { keywords?: string; country?: string };

/** Why `source` can't search the country, in words, or undefined. */
export function uncoveredCountry(source: JobSource | null, query: SearchQuery, countries: readonly Country[]): string | undefined {
  if (!source || !query.country || sourceCovers(source, query.country)) return undefined;
  const name = countries.find((country) => country.code === query.country)?.name ?? query.country.toUpperCase();
  return `${SOURCE_INFO[source].name} doesn't list jobs in ${name}.`;
}

/** What, Where, Country, Within and Posted, for a grid; Remote only is RemoteOnlyField. */
export function SearchFields({
  value,
  onChange,
  source,
  countries,
  errors = {},
  onBlur,
}: {
  value: SearchQuery;
  onChange: (patch: Partial<SearchQuery>) => void;
  source: JobSource | null;
  countries: readonly Country[];
  errors?: SearchFieldErrors;
  /** For text fields that save once typing is done. */
  onBlur?: () => void;
}) {
  const uncovered = uncoveredCountry(source, value, countries);
  const noRadius = source !== null && !SOURCE_INFO[source].radius;
  return (
    <>
      <Input
        label="What"
        className="sm:col-span-2 lg:col-span-1"
        value={value.keywords}
        placeholder="Job title, skill or company"
        error={errors.keywords}
        onChange={(event) => onChange({ keywords: event.target.value })}
        onBlur={onBlur}
      />
      <Input label="Where" value={value.place} placeholder="City or region" hint={source === "REMOTEOK" ? "Remote OK doesn't filter by location." : undefined} onChange={(event) => onChange({ place: event.target.value })} onBlur={onBlur} />
      <Select label="Country" value={value.country} error={errors.country ?? uncovered} hint={source === "REMOTEOK" ? "Choose your country, then check eligibility in each post." : undefined} onChange={(event) => onChange({ country: event.target.value })}>
        <option value="">Choose a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>
      <Select
        label="Within"
        value={String(value.radiusKm)}
        disabled={noRadius || !value.place.trim()}
        hint={noRadius ? `${SOURCE_INFO[source].name} has no distance filter` : value.place.trim() ? undefined : "Add a place first"}
        onChange={(event) => onChange({ radiusKm: Number(event.target.value) as RadiusKm })}
      >
        {RADII_KM.map((km) => (
          <option key={km} value={km}>
            {km} km
          </option>
        ))}
      </Select>
      <Select label="Posted" value={value.postedWithin} hint={source === "REMOTEOK" ? "Check the posting date on the original listing." : undefined} onChange={(event) => onChange({ postedWithin: event.target.value as SearchQuery["postedWithin"] })}>
        {POSTED_WITHIN.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select label="Experience / level" value={value.experienceLevel ?? "any"} hint="Adds matching terms; source filters vary." onChange={(event) => onChange({ experienceLevel: event.target.value as SearchQuery["experienceLevel"] })}>
        {EXPERIENCE_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>{level.label}</option>
        ))}
      </Select>
      <Select label="Opportunity type" value={value.opportunityType ?? "any"} hint="Adds search terms; confirm eligibility on the original post." onChange={(event) => onChange({ opportunityType: event.target.value as SearchQuery["opportunityType"] })}>
        {OPPORTUNITY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </Select>
      {value.country === "in" && (
        <div className="self-end pb-2 text-meta">
          <span className="mr-2 text-muted">More India sources:</span>
          <a className="mr-3 text-primary underline underline-offset-2 hover:text-ink" href="https://www.ncs.gov.in/" target="_blank" rel="noopener noreferrer">National Career Service ↗</a>
          <a className="text-primary underline underline-offset-2 hover:text-ink" href="https://techreferrals.in/" target="_blank" rel="noopener noreferrer">Tech referrals ↗</a>
        </div>
      )}
    </>
  );
}

/** "Remote only", with what it means on Adzuna, which has no such filter. */
export function RemoteOnlyField({ value, onChange, source }: { value: SearchQuery; onChange: (patch: Partial<SearchQuery>) => void; source: JobSource | null }) {
  return (
    <Checkbox
      label="Remote only"
      checked={value.remoteOnly}
      onChange={(event) => onChange({ remoteOnly: event.target.checked })}
      hint={source === "ADZUNA" && value.remoteOnly ? "Adzuna has no remote filter, so this adds “remote” to your search." : undefined}
    />
  );
}

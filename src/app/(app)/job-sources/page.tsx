import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { buttonClassName } from "@/components/ui/button";
import { countryName } from "@/lib/job-search/countries";
import { JOB_SOURCES } from "@/lib/job-search/search";
import { SOURCE_INFO } from "@/lib/job-search/sources";

export const metadata: Metadata = { title: "Job source coverage" };

const broadCoverage: Partial<Record<(typeof JOB_SOURCES)[number], string>> = {
  JSEARCH: "Broad international search through Google for Jobs. Coverage depends on role and country.",
  FREEHIRE: "Company career pages across many countries, with a focus on technology roles. No distance filter.",
  REMOTEOK: "Remote roles from a public feed. The countries a role accepts vary by posting.",
  STUDENT_FEEDS: "Regional public feeds: InternScan lists its supported regions; FresherFlow is India-focused.",
};

function coverage(source: (typeof JOB_SOURCES)[number]): string {
  const countries = SOURCE_INFO[source].countries;
  if (countries) return countries.map(countryName).join(", ");
  return broadCoverage[source] ?? "Broad coverage; confirm availability on the original listing.";
}

export default function JobSourcesPage() {
  return (
    <>
      <PageHeader
        title="Job source coverage"
        description="GradTrail searches one source at a time. Coverage, dates, eligibility details, and search filters vary by provider; always check the employer’s original post."
      />
      <div className="flex flex-col gap-6 px-4 pb-16 sm:px-10">
        <section aria-labelledby="start-without-key" className="max-w-[900px] rounded-panel border border-line-card bg-card p-6">
          <h2 id="start-without-key" className="font-serif text-section">Start without an API key</h2>
          <p className="mt-2 text-sm text-muted">In Settings → Job search, choose FreeHire for company career pages, Remote OK for remote roles, or Student and internship feeds. You can search and track applications without setting up AI. Some other sources require provider keys, and optional services may have their own limits or costs.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/settings?section=jobs" className={buttonClassName("primary", "sm", "hover:text-on-primary")}>Choose a source</Link>
            <Link href="/privacy-costs" className={buttonClassName("secondary", "sm")}>Privacy and possible costs</Link>
          </div>
        </section>

        <div className="grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-2">
          {JOB_SOURCES.map((source) => {
            const info = SOURCE_INFO[source];
            return (
              <article key={source} className="flex flex-col gap-3 rounded-panel border border-line-card bg-card p-5">
                <div>
                  <h2 className="font-serif text-section">{info.name}</h2>
                  <p className="mt-1 text-meta text-muted">{info.tag}</p>
                </div>
                <p className="text-sm text-muted">{info.description}</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-xs">
                  <dt className="text-muted">Coverage</dt>
                  <dd>{coverage(source)}</dd>
                  <dt className="text-muted">API key</dt>
                  <dd>{info.keyUrl ? "Required" : "Not required"}</dd>
                  <dt className="text-muted">Distance filter</dt>
                  <dd>{info.radius ? "Supported" : "Not supported by this source"}</dd>
                  <dt className="text-muted">Quota</dt>
                  <dd>{info.quotaPeriod ? `Provider limits may apply (${info.quotaPeriod})` : "Check provider terms; limits may change"}</dd>
                </dl>
                {source === "USAJOBS" && <p className="text-xs text-muted">USAJOBS also requires the email registered with the API key. Its postings are U.S. federal announcements; check citizenship and other eligibility on the official notice.</p>}
                {source === "ARBEITSAGENTUR" && <p className="text-xs text-warning">Unofficial Germany-only source. It uses access the agency does not permit for automated use and can stop working at any time.</p>}
                {source === "STUDENT_FEEDS" && <p className="text-xs text-muted">Feeds can change and may have no employer-posted date. Confirm role availability and eligibility on the original link.</p>}
              </article>
            );
          })}
        </div>
        <p className="max-w-[900px] text-xs leading-relaxed text-muted">A “no API key” label means GradTrail does not ask you for a provider key to use that source. Public feeds and provider terms can change. A source’s filters are not a guarantee of eligibility, current openings, or complete country coverage.</p>
      </div>
    </>
  );
}

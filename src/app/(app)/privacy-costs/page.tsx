import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Privacy and possible costs" };

const items = [
  {
    title: "Your GradTrail data stays in the database you run",
    body: "GradTrail is self-hosted. Your profile, applications, notes, and saved postings are stored in its PostgreSQL database on your computer or server. If you run it on someone else’s server, that server’s administrator controls the machine and database.",
  },
  {
    title: "Job searches send the query to the chosen source",
    body: "Search keywords, location, and filters are sent to the job source you select. Regular job-source searches do not send your profile. USAJOBS also requires the email registered with its API key. Read each source’s terms and the source coverage guide before configuring it.",
  },
  {
    title: "AI is optional",
    body: "You can search, save jobs, and track applications without configuring AI. A local model can keep AI processing on your own hardware. A hosted AI provider receives the information needed to generate or refine the requested documents; provider terms and charges apply.",
  },
  {
    title: "Potential costs depend on what you choose",
    body: "GradTrail is free, open-source software. FreeHire, Remote OK, and student feeds can be used without entering an API key, though public feeds and terms can change. Other sources may require keys and have quotas or paid usage. Hosted AI, a remote server, and ongoing hosting can cost money. No hosted GradTrail plan is currently offered.",
  },
  {
    title: "Optional integrations are separate",
    body: "If you connect Gmail, Calendar, or another external provider, the relevant data is sent to that service as part of the feature you use. Review the full privacy documentation and provider terms before connecting accounts.",
  },
];

export default function PrivacyCostsPage() {
  return (
    <>
      <PageHeader title="Privacy and possible costs" description="A quick guide to what runs locally, what leaves for a provider, and which choices may cost money." />
      <div className="flex max-w-[900px] flex-col gap-4 px-4 pb-16 sm:px-10">
        {items.map((item) => (
          <section key={item.title} className="rounded-panel border border-line-card bg-card p-5">
            <h2 className="font-serif text-section">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </section>
        ))}
        <p className="text-sm text-muted">For retention, backups, deletion, local-model details, and the complete data-flow explanation, read <Link href="https://github.com/knowprasad/gradtrail/blob/main/PRIVACY.md" className="underline underline-offset-2">the full privacy documentation</Link>.</p>
      </div>
    </>
  );
}

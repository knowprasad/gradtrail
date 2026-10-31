import { afterEach, describe, expect, it, vi } from "vitest";

import { json, stubFetch } from "@/lib/ai/test-http";

import { startupJobs } from "./startup-jobs";
import { EMPTY_QUERY } from "./search";

afterEach(() => vi.unstubAllGlobals());

const xml = (items: string) => `<?xml version="1.0"?><rss version="2.0"><channel>${items}</channel></rss>`;
const item = (title: string, guid: string, description = "A role for a thoughtful builder.", pubDate = "2026-10-30T09:00:00Z") =>
  `<item><title>${title}</title><guid>${guid}</guid><description><![CDATA[${description}]]></description><pubDate>${pubDate}</pubDate></item>`;
const query = { ...EMPTY_QUERY };

describe("Startup.jobs RSS adapter", () => {
  it("maps a public listing and requests its feed URL", async () => {
    const requests = stubFetch(() => new Response(xml(item(
      "Senior Product Designer at Canalworks",
      "https://startup.jobs/senior-product-designer-123",
      "Design tools for teams.\nRemote · €90,000–€110,000 per year",
    )), { headers: { "content-type": "application/rss+xml" } }));

    const page = await startupJobs.search(query, {}, null, { baseUrl: "http://localhost:3998/startup_jobs" });

    expect(requests[0].url.href).toBe("http://localhost:3998/startup_jobs/feeds/jobs");
    expect(page).toMatchObject({ next: null, postings: [{
      source: "STARTUP_JOBS",
      externalId: "https://startup.jobs/senior-product-designer-123",
      title: "Senior Product Designer",
      company: "Canalworks",
      place: "Remote",
      remote: true,
      salary: "€90,000–€110,000 per year",
      postedAt: "2026-10-30T09:00:00.000Z",
      url: "https://startup.jobs/senior-product-designer-123",
      via: "Startup.jobs",
      description: "Design tools for teams.",
      complete: true,
    }] });
  });

  it("uses link when guid is not a safe URL and ignores invalid feed items", async () => {
    const valid = `<item><title>Product Designer at Acme</title><guid>not a URL</guid><link>https://startup.jobs/jobs/acme</link><description>Make good tools</description></item>`;
    const badTitle = item("Product Designer", "https://startup.jobs/jobs/no-company");
    const badHost = item("Product Designer at Acme", "https://example.com/jobs/acme");
    stubFetch(() => new Response(xml(`${valid}${badTitle}${badHost}`)));

    const result = await startupJobs.search(query, {}, null);

    expect(result.postings).toHaveLength(1);
    expect(result.postings[0]).toMatchObject({ title: "Product Designer", company: "Acme", url: "https://startup.jobs/jobs/acme", postedAt: null });
  });

  it("applies location, remote, experience, opportunity, compensation and date filters", async () => {
    const listings = [
      item("Software Engineering Intern (Remote) at RemoteCo", "https://startup.jobs/intern", "A paid 3-month internship", "2026-10-30T09:00:00Z"),
      item("Senior Software Engineer at BerlinCo", "https://startup.jobs/berlin", "Backend role · Berlin, Germany · €100,000 per year", "2026-10-30T09:00:00Z"),
    ].join("");
    stubFetch(() => new Response(xml(listings)));

    const interns = await startupJobs.search({ ...EMPTY_QUERY, keywords: "software", country: "de", remoteOnly: true, experienceLevel: "intern", opportunityType: "internship", compensation: "paid", internshipDuration: "1-3-months", postedWithin: "week" }, {}, null);
    expect(interns.postings.map((posting) => posting.company)).toEqual(["RemoteCo"]);

    const berlin = await startupJobs.search({ ...EMPTY_QUERY, place: "Berlin", country: "de", experienceLevel: "senior", compensation: "paid" }, {}, null);
    expect(berlin.postings.map((posting) => posting.company)).toEqual(["BerlinCo"]);

    const noMatch = await startupJobs.search({ ...EMPTY_QUERY, place: "Tokyo", opportunityType: "apprenticeship", compensation: "unpaid", postedWithin: "day" }, {}, null);
    expect(noMatch.postings).toEqual([]);
  });

  it("reports changed feeds and source HTTP errors clearly", async () => {
    stubFetch(() => new Response("not RSS"));
    await expect(startupJobs.search(query, {}, null)).rejects.toMatchObject({ problem: "changed" });

    stubFetch(() => json({}, { status: 429 }));
    await expect(startupJobs.search(query, {}, null)).rejects.toMatchObject({ problem: "quota" });
  });

  it("tests the source with a no-key sample query and returns posting details", async () => {
    const requests = stubFetch(() => new Response(xml(item("Software Engineer at Example", "https://startup.jobs/software-engineer"))));
    const posting = (await startupJobs.search(query, {}, null)).postings[0];
    await expect(startupJobs.details(posting, {})).resolves.toBe("A role for a thoughtful builder.");
    await startupJobs.test({}, { baseUrl: "http://localhost:3998/startup_jobs" });
    expect(requests).toHaveLength(2);
    expect(requests[1].url.searchParams.get("role")).toBe("software engineer");
  });
});

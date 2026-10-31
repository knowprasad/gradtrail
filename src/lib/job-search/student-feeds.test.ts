import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { json, stubFetch } from "@/lib/ai/test-http";

import { clearJobSearchCache } from "./cache";
import { searchPostings, testSource } from "./index";
import { EMPTY_QUERY } from "./search";
import { sourceCovers } from "./sources";

const fresher = {
  jobs: [
    { id: "active-swe", company: "Google", title: "Software Engineering Intern 2027", type: "INTERNSHIP", status: "PUBLISHED", locations: ["Bengaluru"], workMode: "ONSITE", applyLink: "https://careers.google.com/jobs/active", dateAdded: "2026-10-29", notesHighlights: "Summer 2027 software role.", allowedPassoutYears: [2027] },
    { id: "expired-swe", company: "Meta", title: "Software Engineer Intern", type: "INTERNSHIP", status: "EXPIRED", locations: ["Bengaluru"], applyLink: "https://careers.meta.com/jobs/expired" },
    { id: "sales", company: "Acme", title: "Sales Intern", type: "INTERNSHIP", status: "PUBLISHED", locations: ["Bengaluru"], applyLink: "https://jobs.acme.test/sales" },
    { id: "fresher", company: "Razorpay", title: "Graduate Software Engineer", type: "JOB", status: "PUBLISHED", locations: ["Bengaluru"], applyLink: "https://razorpay.com/jobs/fresher", allowedPassoutYears: [2027] },
  ],
};
const intern = {
  updated_at: "2026-10-31T00:00:00Z",
  jobs: {
    "google:active-swe": { active: true, category: "Software", city_tag: "Bengaluru", company: "Google", country: "in", external_id: "active-swe", first_seen: "2026-10-30", locations: ["Bengaluru, India"], posted: "2026-10-30", title: "Software Engineering Intern 2027", url: "https://careers.google.com/jobs/active?utm_source=internscan" },
    "cloudsek:closed": { active: false, category: "Security", city_tag: "Bengaluru", company: "CloudSEK", country: "in", external_id: "closed", first_seen: "2026-10-29", locations: ["Bengaluru, India"], posted: "2026-10-28", title: "Security Engineer Intern", url: "https://jobs.example/closed" },
    "stripe:remote": { active: true, category: "Software", city_tag: "Remote", company: "Stripe", country: "remote", external_id: "remote", first_seen: "2026-10-29", locations: ["Remote - Worldwide"], posted: "2026-10-30", title: "Software Engineer Intern", url: "https://jobs.example/remote" },
    "adobe:us-intern": { active: true, category: "Software", city_tag: "San Jose", company: "Adobe", country: "us", external_id: "us-intern", first_seen: "2026-10-29", locations: ["San Jose, United States"], posted: "2026-10-21", title: "2027 Intern - Software Engineer", url: "https://jobs.example/us-intern" },
    "sap:eu-intern": { active: true, category: "Software", city_tag: "Berlin", company: "SAP", country: "eu", external_id: "eu-intern", first_seen: "2026-10-29", locations: ["Berlin, Germany"], posted: "2026-10-20", title: "Software Engineering Intern", url: "https://jobs.example/eu-intern" },
  },
};

beforeEach(() => {
  clearJobSearchCache();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function feedRoute() {
  const requests = stubFetch(({ url }) => url.pathname.toLowerCase().includes("fresherflow") ? json(fresher) : json(intern));
  return requests;
}

describe("worldwide student feeds", () => {
  it("combine active technical India roles, deduplicate, and preserve original links and dates", async () => {
    const requests = feedRoute();
    const result = await searchPostings("STUDENT_FEEDS", {}, { ...EMPTY_QUERY, country: "in" });
    expect(requests).toHaveLength(2);
    expect(result.postings.map(({ title, company }) => [title, company])).toEqual([
      ["Software Engineering Intern 2027", "Google"],
      ["Software Engineer Intern", "Stripe"],
      ["Graduate Software Engineer", "Razorpay"],
    ]);
    const google = result.postings[0];
    expect(google).toMatchObject({ source: "STUDENT_FEEDS", url: "https://careers.google.com/jobs/active?utm_source=internscan", postedAt: "2026-10-30T00:00:00.000Z", via: "InternScan · first seen 2026-10-30", complete: false });
    expect(result.postings.some(({ company }) => company === "Meta" || company === "Acme" || company === "CloudSEK")).toBe(false);
  });

  it("filters internships, batch years, and location; FresherFlow is India-specific", async () => {
    const requests = feedRoute();
    expect(sourceCovers("STUDENT_FEEDS", "us")).toBe(true);
    expect(requests).toHaveLength(0);
    const result = await searchPostings("STUDENT_FEEDS", {}, { ...EMPTY_QUERY, country: "in", opportunityType: "internship", graduationYear: 2027, place: "Bangalore" });
    expect(result.postings).toHaveLength(1);
    expect(result.postings[0].company).toBe("Google");
    expect(sourceCovers("STUDENT_FEEDS", "in")).toBe(true);
    expect(sourceCovers("STUDENT_FEEDS", "us")).toBe(true);
  });

  it("searches the global feed for the selected country and includes worldwide remote roles", async () => {
    const requests = feedRoute();
    const result = await searchPostings("STUDENT_FEEDS", {}, { ...EMPTY_QUERY, country: "us" });
    expect(requests).toHaveLength(1);
    expect(result.postings.map(({ company }) => company)).toEqual(["Stripe", "Adobe"]);
  });

  it("maps the global Europe region to European country searches", async () => {
    feedRoute();
    const result = await searchPostings("STUDENT_FEEDS", {}, { ...EMPTY_QUERY, country: "de" });
    expect(result.postings.map(({ company }) => company)).toContain("SAP");
    expect(result.postings.map(({ company }) => company)).toContain("Stripe");
  });

  it("reports when a public feed changes shape", async () => {
    stubFetch(({ url }) => json(url.pathname.toLowerCase().includes("fresherflow") ? { unexpected: [] } : intern));
    await expect(searchPostings("STUDENT_FEEDS", {}, { ...EMPTY_QUERY, country: "in" })).rejects.toMatchObject({ problem: "changed" });
  });

  it("can test both feeds without credentials", async () => {
    feedRoute();
    await expect(testSource("STUDENT_FEEDS", {})).resolves.toBeUndefined();
  });
});

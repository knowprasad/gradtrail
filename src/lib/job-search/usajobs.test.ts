import { afterEach, describe, expect, it, vi } from "vitest";

import { json, stubFetch } from "@/lib/ai/test-http";

import { usajobs } from "./usajobs";
import { EMPTY_QUERY } from "./search";
import { sourceCovers } from "./sources";

const credentials = { key: "key-secret", email: "registered@example.com" };
const query = {
  ...EMPTY_QUERY,
  keywords: "software developer",
  place: "Washington, DC",
  country: "us",
  radiusKm: 50 as const,
  postedWithin: "week" as const,
  opportunityType: "internship" as const,
  remoteOnly: true,
};

const response = {
  SearchResult: {
    UserArea: { NumberOfPages: 2 },
    SearchResultItems: [{
      MatchedObjectId: 123,
      MatchedObjectDescriptor: {
        PositionID: "STUDENT-123",
        PositionTitle: "Software Engineering Intern",
        PositionURI: "https://www.usajobs.gov/job/123",
        ApplyURI: ["https://www.usajobs.gov/job/123/apply"],
        PositionLocationDisplay: "Washington, District of Columbia",
        OrganizationName: "Example Agency",
        RemoteIndicator: false,
        PublicationStartDate: "2026-10-28T00:00:00Z",
        ApplicationCloseDate: "2026-11-08T23:59:00Z",
        PositionOfferingType: [{ Name: "Internship" }],
        PositionRemuneration: [{ MinimumRange: 20, MaximumRange: 25, RateIntervalCode: "PH" }],
        PositionFormattedDescription: [{ Label: "Duties", Content: "Build reliable software." }],
        UserArea: { Details: { WhoMayApply: { Name: "U.S. citizens and nationals" } } },
      },
    }],
  },
};

afterEach(() => vi.unstubAllGlobals());

describe("USAJOBS search", () => {
  it("is offered for U.S. searches only", () => {
    expect(sourceCovers("USAJOBS", "us")).toBe(true);
    expect(sourceCovers("USAJOBS", "in")).toBe(false);
  });

  it("uses the public search API with registered identity and relevant student filters", async () => {
    const requests = stubFetch(() => json(response));
    const page = await usajobs.search(query, credentials, null);
    const [{ url, headers }] = requests;
    expect(`${url.origin}${url.pathname}`).toBe("https://data.usajobs.gov/api/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      Keyword: "software developer internship intern",
      WhoMayApply: "Public",
      Fields: "Full",
      ResultsPerPage: "25",
      Page: "1",
      LocationName: "Washington, DC",
      Radius: "31",
      DatePosted: "7",
      RemoteIndicator: "True",
      HiringPath: "student;graduates",
    });
    expect(headers.get("Authorization-Key")).toBe("key-secret");
    expect(headers.get("User-Agent")).toBe("registered@example.com");
    expect(url.href).not.toContain("key-secret");
    expect(page).toMatchObject({ next: "page:2", postings: [{
      source: "USAJOBS",
      externalId: "STUDENT-123",
      title: "Software Engineering Intern",
      company: "Example Agency",
      postedAt: "2026-10-28T00:00:00.000Z",
      url: "https://www.usajobs.gov/job/123/apply",
      remote: false,
      salary: "$20–$25 an hour",
      description: expect.stringContaining("Who may apply: U.S. citizens and nationals"),
      complete: true,
    }] });
    expect(page.postings[0].description).toContain("Application closes: 2026-11-08");
  });

  it("does not send optional filters for ordinary searches and stops on the last page", async () => {
    stubFetch(() => json({ SearchResult: { UserArea: { NumberOfPages: 1 }, SearchResultItems: [] } }));
    const page = await usajobs.search({ ...EMPTY_QUERY, country: "us" }, credentials, "page:1");
    expect(page).toEqual({ postings: [], next: null });
  });

  it("marks a rejected key as a credential problem", async () => {
    stubFetch(() => json({}, { status: 401 }));
    await expect(usajobs.test(credentials)).rejects.toMatchObject({ problem: "key" });
  });
});

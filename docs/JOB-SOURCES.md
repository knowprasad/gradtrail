# Job source coverage

**Find jobs** searches one selected provider at a time. It does not combine every job source into one search. **Startups** is a separate discovery page that refreshes several public feeds together. Coverage and posting fields vary by source; the original employer or provider page is the authority.

## Start without an API key

In **Settings → Job search**, choose one of these sources:

- **FreeHire** searches public company career pages, with a focus on technology roles. No API key; no distance filter.
- **Remote OK** reads a public remote-jobs feed. No API key; role tags, country eligibility, and dates vary by posting.
- **Startup Jobs** reads Startup.jobs' public RSS feed, up to 50 recent entries. No API key. It includes a wider mix of employers than startups, links each result to Startup.jobs, and requires visible source credit. Country and experience filters are based on listing text; confirm eligibility on the linked post.
- **Student and internship feeds** use public feeds from InternScan and FresherFlow. No API key. InternScan includes listings from multiple countries and remote roles; FresherFlow contributes India listings. Coverage and fields change with each feed.

Searching, saving postings, and tracking applications do not require AI. You can configure AI later, or skip it.

## Other sources

| Source | Coverage | Key / limits | Notes |
|---|---|---|---|
| JSearch | Broad international coverage through Google for Jobs | API key; provider quota applies | Results may link to LinkedIn, Indeed, Glassdoor, and employer pages. Country/role coverage varies. |
| Adzuna | Australia, Austria, Belgium, Brazil, Canada, France, Germany, India, Italy, Mexico, Netherlands, New Zealand, Poland, Singapore, South Africa, Spain, Switzerland, United Kingdom, United States | App ID and API key; provider quota applies | Returns a posting excerpt; open the original listing for the full announcement. |
| Jooble | India in this integration | API key; 500 lifetime requests on the listed free tier | The provider quota or plan may change. |
| USAJOBS | U.S. federal public announcements | API key and the registered email address | Includes student/recent-graduate hiring paths where relevant. Federal eligibility rules vary; read the official announcement. |
| Bundesagentur für Arbeit | Germany | No key | Unofficial integration; the agency terms do not permit automated access. It is optional, can stop working, and is used at the user's responsibility. |

## Startup discovery

The **Startups** page combines these sources when refreshed; it does not need a job-search API key or a separate source selection:

| Source | What GradTrail reads | Limits and checks |
|---|---|---|
| Y Combinator job posts | Hacker News' public `jobstories` feed, then the current job-post items | Reads up to 100 recent item IDs. Only items that look like hiring posts become leads; titles, locations, roles, and dates may be incomplete. |
| Hacker News “Who is hiring?” | The current monthly hiring thread from the public Algolia API and its replies | The app keeps roles that appear relevant to the profile's city/country, or remote roles that are not limited to other places. Check the post itself. |
| Startup.jobs | The same public RSS feed used by Find jobs | Up to 50 recent entries; the feed can include larger employers as well as startups. |

GradTrail scores leads against the saved profile using local matching rules. On refresh it can check up to 12 eligible company websites for published role addresses, with at most four sites checked at once. It follows each site's `robots.txt`; it does not send applications or messages. Personal addresses are only sought when the user asks for them.

The exact source list and source settings appear in the app under **Settings → Job search**. Key requirements, quota information, and provider terms can change.

## What filters and result details mean

Location, remote status, posting-date filters, experience, and opportunity type are not enforced identically across providers. Some are search-term hints rather than strict filters. Some sources do not provide an employer-posted date or eligibility fields. GradTrail labels missing details; open the original post to confirm that the role is active and that you qualify.

Every result provides an original-post link when the source supplies one. The posting timeline shows the employer-posted date when available; otherwise it says the source did not provide one. A feed's first-seen date is not the same as the employer's posting date.

## First search

1. Choose FreeHire, Remote OK, Startup Jobs, or Student and internship feeds if you want to begin without an API key.
2. Choose your country, add a role or skill, and set any filters that matter.
3. Check the source, date, missing eligibility details, and original link before applying.
4. Save relevant postings, then start an application to track its stage and follow-up.

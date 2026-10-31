# Performance and architecture

This note describes how GradTrail runs, what has been measured, and where its current design is intended to scale. It separates development-server observations from production measurements.

## How a request runs

- **One app process and PostgreSQL.** GradTrail is a single-user, single-instance application. It does not need Redis or a separate worker service. Database state is kept in PostgreSQL; scheduled work and long-running AI jobs are coordinated by the Node.js app process.
- **One chosen job-search provider.** A Find jobs search calls only the selected provider. Successful search pages and posting details are cached in memory for 30 minutes, up to 200 entries. Restarting the app clears this cache. Provider requests have time and response-size limits; external network and quota delays are outside GradTrail's control.
- **Persisted background jobs.** Document generation, scoring and other long tasks are saved in PostgreSQL and report progress over server-sent events. A local AI provider is limited to one job at a time; hosted providers can run up to three. The queue and its listeners are process-local, so run one app instance per database.
- **Scheduled checks run in the app.** Startups refresh, inbox sync, agent runs, backups and opted-in saved-search alerts use in-process timers. They do not need a separate scheduler container, but multiple app replicas would run duplicate schedules and are not supported.
- **Startup refresh is bounded.** YC, Hacker News and Startup.jobs are requested together. The YC feed is capped at 100 item IDs and Startup.jobs at 50 entries. A refresh checks at most 12 eligible company sites for public role addresses, with four lookups at a time. Startup matching is local and does not require AI.

## Database work

Application postings store a SHA-256 hash of the canonical URL, which ignores common tracking parameters. Find jobs uses an index on this hash to identify applications made before a posting was discovered, instead of loading all application URLs into Node for each result page. New applications and restored imports write the hash directly. Existing installations fill missing hashes the first time this match is needed; a large older application history can make that first backfill slower.

The dashboard currently reads application summaries and calculates funnel figures in the app. Startup filtering includes location and free-text checks in the app after database filters. These choices keep the single-user setup simple; very large application or startup histories should be measured before increasing workload or serving several users from one database.

## Measurements

### Production reference measurement

The README records a production-build benchmark dated 28 September 2026, measured with 90 and 900 demo applications. Treat it as a reference for that build and environment, not as a guarantee for every computer or the newer uncommitted code in this checkout.

### Local development snapshot

On 31 October 2026, this checkout was running under Docker Compose in Next.js development mode on a machine with about 7.6 GiB available to Docker. A `docker stats` snapshot showed roughly 936 MiB for the app container and 307 MiB for PostgreSQL. Warm `/jobs` and `/startups` requests in the server log were generally around 200–500 ms. Cold route compilation took about 10–18 seconds. The local `Application`, `Posting` and `PostingSearch` tables were empty at that time.

These numbers describe a development server with no saved job data. Cold compilation is a development-mode cost; this snapshot is not a production benchmark, and it does not establish performance with real application history or slow external providers.

## Running locally and in production

The root `compose.yml` and `scripts/setup.ps1` / `scripts/setup.sh` run the source checkout with `next dev`. This is convenient for trying the app and editing it; a page may compile on first visit and the development process uses more memory than the production server.

For a server, build and publish the production image through the repository's CI and Release workflows, then use [`compose.production.yml`](../compose.production.yml). The production container has a 1 GiB memory limit; the README's sizing guidance allows at least 2 vCPUs and 2 GiB for the machine so PostgreSQL and the operating system also have room. Use HTTPS at a reverse proxy and keep one app instance per database.

To pick up local code and schema changes, run `docker compose up -d --build`. Compose starts the database, applies migrations, seeds built-in data, and then starts the app. The PostgreSQL volume holds the user's data; do not add `--volumes` or delete the database volume when updating.

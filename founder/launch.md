# GradTrail 30-day validation launch

**Window:** 1–30 November 2026 (Asia/Kolkata). This is an adoption and usability test for the public open-source project, not a launch of a hosted commercial service. The public GitHub repository already exists.

**Owner:** Prasad (founder/maintainer), unless a task below is marked as a participant task.

## Cheap real-world test before spending

Recruit 10–15 students, recent graduates, and early-career developers in at least three countries. Include people using Windows, macOS, and Linux where available, and ask about laptop memory, Docker familiarity, and whether they will configure a job-search or AI API key. Do not require participants to share credentials.

Give them the README/setup guide and ask them to complete four tasks on their own device: get the app running, configure or inspect a source, find a relevant role, and save/track one application. Observe without taking over. Ask what cost, source coverage, privacy, and resource needs they expected.

**Success line (proposed before testing):** At least 8 of 12 participants complete setup and reach a first search within 20 minutes without one-to-one intervention; at least 9 of 12 can identify the original job link and posting-date caveat; no participant is surprised by a required secret, API key, hosting cost, or memory requirement. If setup success is below 8/12, pause broad promotion and fix onboarding first. If the participant pool differs from 12, report raw counts and do not quietly adjust the threshold after seeing results.

**Test surface:** Public README and repository, a short opt-in feedback form, and a local demo recording or screenshots if participants consent. Do not advertise a waitlist as a paid pre-order: no hosted service, paid plan, or commercial price exists.

## Countdown and owners

| Date | Owner | Work | Gate |
|---|---|---|---|
| Nov 1–3 | Founder | Freeze the test tasks; list supported sources, regions, required keys, machine requirements, and current known limitations in one setup page | A participant can see prerequisites before cloning |
| Nov 4–7 | Founder | Prepare a clean demo dataset and a feedback form; verify demo does not expose personal data or real credentials | Demo can be reset safely; no participant secrets collected |
| Nov 8–12 | Founder | Recruit 12 participants across at least three countries; schedule 30-minute sessions | Cohort reflects students and early-career developers, not only developer friends |
| Nov 13–20 | Founder + participants | Run observed install/search/track sessions on participants' own laptops; record time, errors, device resources, and source/provider | No live changes to participant machines without explicit consent |
| Nov 21–24 | Founder | Fix the top two setup blockers; rerun those tasks with at least three participants | Fixes do not require hidden credentials or unsupported machine specs |
| Nov 25–27 | Founder | Publish a concise findings note and updated setup instructions; separate confirmed results from assumptions | No simulated panel quote presented as a testimonial |
| Nov 28–30 | Founder | Decide whether to proceed to a broader open-source adoption launch, hold for setup work, or test demand for a hosted edition | Decision based on success line and actual user feedback |

**Critical path:** Recruit the cohort by Nov 12. Without participant sessions, there is no real-world validation; do not substitute a simulated panel for this gate.

## Validation day run sheet (Nov 13–20 sessions)

| Session time | Owner | Action |
|---|---|---|
| 0–5 min | Founder | Explain purpose, consent, data handling, and that the participant should not share API keys or passwords |
| 5–10 min | Participant | Read prerequisites and start setup without verbal coaching; founder records elapsed time and confusion points |
| 10–20 min | Participant | Open app and test a relevant search using a source configured by the participant or a safe demo mode |
| 20–25 min | Participant | Open the original posting link, inspect its date, and save/track the opportunity |
| 25–30 min | Founder | Ask which step felt hardest, whether expected costs were clear, and what would make them use it next week |

If a setup or search fails, capture the error and environment, stop before exposing credentials, and offer the README fallback. Do not imply that a demo result is a live listing.

## First 30 days: measures and change triggers

- **Setup completion:** count participants who reach first search; trigger: below 8/12 means fix setup before more promotion.
- **Time to first search:** median minutes from opening instructions; trigger: over 20 minutes means reduce or clarify first-run steps.
- **Search usefulness:** ask whether at least one result was relevant and whether source, original link, and posting date were understandable; track missing-date/source limitations.
- **Application workflow:** count participants who save and update one application record; trigger: fewer than 9/12 understand the flow, simplify labels/workflow.
- **Resource footprint:** record memory use, CPU, startup time, OS, and browser on participant devices; trigger: app exceeds documented sizing guidance on supported devices, investigate before claiming it runs well on student laptops.
- **Unexpected costs:** ask whether hosting/provider/key costs were clear before setup; any surprise triggers a README/Settings disclosure fix.
- **Privacy and trust:** record concerns and any actual accidental exposure; any credential or personal-data exposure is a stop-and-fix issue.

**Review dates:** Nov 20 (day 7 of sessions), Nov 27 (day 14), and Nov 30 (day 30 overall). At each review, decide: what blocked first value, which job sources users expected but lacked, and whether self-hosting still fits this audience.

## After day 30

Proceed with a broader open-source adoption announcement only if the setup success line is met and the documentation states source coverage and costs clearly. If users want a ready-to-use product, separately validate the demand and operating economics of a hosted service before building or promising one. No launch date for a hosted product is implied by this plan.

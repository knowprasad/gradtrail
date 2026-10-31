# Product idea: global job-search and application workspace

## Working hypothesis

GradTrail is a free, open-source, self-hosted workspace for students, recent graduates, and early-career developers worldwide. It aims to help them discover relevant opportunities from supported sources, check the original listing and eligibility, build application materials from projects and coursework, and keep applications, deadlines, and follow-ups organized.

This is a working product hypothesis. No real user interviews or demand validation are included in this file; the 20-person panels in `founder/panel/` and `founder/panel_global/` are simulated.

## Current product reality

GradTrail has profile and resume tools, job search through multiple configured sources, a startup finder, application tracking, AI drafting, a daily job agent, and optional Gmail/Calendar connections. Job search can include global aggregators, regional sources, student feeds, and remote postings. Source coverage and fields differ. Results keep original links; dates and eligibility details appear only when the source supplies them. Search includes location, remote status, posting date, experience and opportunity-type filters, with keyword hints where providers do not have native filters.

It is a self-hosted Docker application. Windows, macOS, and Linux setup scripts ask for a sign-in password, create local secrets, and start the app. Search can begin with some public sources that do not require a key; other sources and AI integrations may require provider keys and may incur costs. AI is optional. Local AI can be configured; hosted AI sends the information needed for generation to that provider, as described in the privacy documentation. A hosted GradTrail service is not currently offered.

## Product questions to validate

1. **First cohort:** Test students, recent graduates, and early-career developers across countries before narrowing to a role or region based on observed use.
2. **Onboarding:** Self-hosting remains a meaningful barrier. Observe setup on participants' own laptops, recording OS, Docker familiarity, memory use, time to first search, and whether the source/key requirements were clear.
3. **Source coverage:** Confirm which countries and role types users actually need. Do not promise exhaustive listings; link to original posts and show source limitations.
4. **Eligibility and freshness:** Surface experience, degree, location/work authorization, pay, work mode, dates, duration, and deadline when providers supply them. Make missing fields explicit and send users to the original post for confirmation.
5. **Trust and privacy:** Distinguish source-provided information from GradTrail judgments. Explain what stays local and what an AI provider receives. Avoid “verified” claims without a defined verification process.
6. **Application workflow:** Validate that project-based profiles, multiple role families, application stages, reminders, and follow-ups solve a real problem beyond a spreadsheet or existing tracker.
7. **Operating model:** The current app is self-hosted and free as software. Before proposing a hosted edition or price, estimate hosting, support, data-provider, and AI costs and test demand with real users.

## Customer and pitch assumptions

The profile in `founder/customer.json` is a simulation input, not researched customer data. It focuses on global students and early-career developers because that matches the founder's current direction. Income bands are rough USD inputs required by the buyer-panel script, not global income research. The product pitch is free and self-hosted, with user-paid hosting/provider usage disclosed; no commercial price has been selected.

## Simulated panel notes

- India-only profile, seed 419470: 0 buys / 20 passes. Main objection was the effort and cost uncertainty of self-hosting and provider keys. This panel is retained at `founder/panel/` and should not be represented as global demand.
- Global profile, same seed: 1 buy / 19 passes on the baseline pitch. Convenience dominated; buyers asked for a no-key demo, laptop setup/resource proof, clear source coverage, and privacy/cost explanations. This is qualitative feedback from simulated personas, not a forecast or customer testimony.
- A same-seed global retest of the revised pitch has only 6 of 20 simulated answers because the current agent-thread limit stopped further buyer runs. No before/after rate is reported. The panel can be resumed when buyer-agent capacity is available.

## Next decision

Run the 30-day user-device validation in `founder/launch.md`. Real student and early-career participants should determine whether guided self-hosting is acceptable or whether a hosted product is necessary. Do not add more sources or promise a hosted tier until this setup and coverage test is complete.

# Product idea: India-first job search workspace

## Working hypothesis

Adapt GradTrail into a self-hosted job-search workspace for Indian college students seeking internships and campus placements. It should help them discover legitimate, relevant opportunities, understand eligibility and compensation, tailor application materials from coursework and projects, and keep follow-ups organized.

## Current product reality

GradTrail already has profile and resume tools, job search through JSearch and Adzuna (both can return India results), FreeHire, application tracking, AI drafting, a daily agent, and optional Gmail/Calendar. Search currently centers on keywords, location/country, radius, remote, date posted, and a newly added keyword-hint seniority selector. It is a self-hosted Docker app; users bring database credentials, a long secret, and usually an AI/search provider key.

## Product questions to resolve before implementation

1. **First cohort:** The first segment is now college students seeking internships and campus placements. Choose which kinds of colleges, degrees, study years, and technical roles to prioritize for initial interviews.
2. **Self-hosted onboarding:** Self-hosting is a high setup burden for students. Make installation, database setup, AI/search credential setup, phone usability, and operating cost part of validation; do not silently assume the target can operate a server.
3. **Opportunity data:** JSearch/Adzuna provide broad India coverage today. TechReferrals is a useful referral-post directory, but its terms prohibit bulk copying and automated scraping. Treat it as an outbound destination unless the publisher offers permission or a feed.
4. **Eligibility quality:** Search should distinguish internship, fresher/graduate, experienced roles, degree/year eligibility, experience range, stipend/salary, paid/unpaid, duration, location, work mode, and application deadline where providers actually supply those fields.
5. **Trust:** Expired, duplicate, misleading, unpaid, fee-charging, and unverifiable opportunities are serious risks. Prefer original employer links, report/stale controls, freshness evidence, and clear uncertainty over unsupported “verified” labels.
6. **Application workflow:** Students need projects/coursework in place of work history, placement and internship stages, referral outreach, follow-up reminders, rejection learning, and multiple resumes for role families.

## Planning assumptions

The customer and pitch drafts are hypotheses, not findings from real interviews. The panel script displays income in U.S. dollars, so the profile's income ranges are rough dollar equivalents of the original low student-income assumptions (approximately ₹0–₹1 lakh, ₹0–₹1.7 lakh, and ₹0–₹2.5 lakh annually, using roughly ₹85 per USD). This conversion is only to keep the simulated persona prompts coherent; it is not a researched exchange-rate estimate. No real customer research or product price was supplied. The pitch uses a free self-hosted prototype assumption; server, provider, and API costs are not included.

The corrected 20-buyer panel produced 0 buys and 20 passes. Treat the result as qualitative feedback, not a conversion forecast: all participants are simulated, and the sample is small. The previous run is preserved in `founder/panel_inr_mislabeled/`; it showed INR figures as dollar amounts and must not be used as evidence.

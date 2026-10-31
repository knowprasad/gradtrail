# Product idea: India-first job search workspace · Business plan

**Verdict: Incomplete**

- ✗ 0 of 20 simulated buyers buy (0%, the bar is 25%).
- No numbers yet. Run /founder-cfo, then compile again.

## The idea

### Working hypothesis

Adapt Northstar into a self-hosted job-search workspace for Indian college students seeking internships and campus placements. It should help them discover legitimate, relevant opportunities, understand eligibility and compensation, tailor application materials from coursework and projects, and keep follow-ups organized.

### Current product reality

Northstar already has profile and resume tools, job search through JSearch and Adzuna (both can return India results), FreeHire, application tracking, AI drafting, a daily agent, and optional Gmail/Calendar. Search currently centers on keywords, location/country, radius, remote, date posted, and a newly added keyword-hint seniority selector. It is a self-hosted Docker app; users bring database credentials, a long secret, and usually an AI/search provider key.

### Product questions to resolve before implementation

1. **First cohort:** The first segment is now college students seeking internships and campus placements. Choose which kinds of colleges, degrees, study years, and technical roles to prioritize for initial interviews.
2. **Self-hosted onboarding:** Self-hosting is a high setup burden for students. Make installation, database setup, AI/search credential setup, phone usability, and operating cost part of validation; do not silently assume the target can operate a server.
3. **Opportunity data:** JSearch/Adzuna provide broad India coverage today. TechReferrals is a useful referral-post directory, but its terms prohibit bulk copying and automated scraping. Treat it as an outbound destination unless the publisher offers permission or a feed.
4. **Eligibility quality:** Search should distinguish internship, fresher/graduate, experienced roles, degree/year eligibility, experience range, stipend/salary, paid/unpaid, duration, location, work mode, and application deadline where providers actually supply those fields.
5. **Trust:** Expired, duplicate, misleading, unpaid, fee-charging, and unverifiable opportunities are serious risks. Prefer original employer links, report/stale controls, freshness evidence, and clear uncertainty over unsupported “verified” labels.
6. **Application workflow:** Students need projects/coursework in place of work history, placement and internship stages, referral outreach, follow-up reminders, rejection learning, and multiple resumes for role families.

### Planning assumptions

The customer and pitch drafts are hypotheses, not findings from real interviews. The panel script displays income in U.S. dollars, so the profile's income ranges are rough dollar equivalents of the original low student-income assumptions (approximately ₹0–₹1 lakh, ₹0–₹1.7 lakh, and ₹0–₹2.5 lakh annually, using roughly ₹85 per USD). This conversion is only to keep the simulated persona prompts coherent; it is not a researched exchange-rate estimate. No real customer research or product price was supplied. The pitch uses a free self-hosted prototype assumption; server, provider, and API costs are not included.

The corrected 20-buyer panel produced 0 buys and 20 passes. Treat the result as qualitative feedback, not a conversion forecast: all participants are simulated, and the sample is small. The previous run is preserved in `founder/panel_inr_mislabeled/`; it showed INR figures as dollar amounts and must not be used as evidence.

## Summary

Northstar is a self-hosted job-search and application workspace for Indian college students looking for technical internships and campus placements. It brings supported job search, saved opportunities, application tracking, and AI-assisted resume and cover-letter drafts into one workspace.

**Verdict: Incomplete.** There is no financial model, so unit margin, break-even, and Year 1 operating profit are unknown. A simulated 20-person buyer panel produced **0 buys and 20 passes**; this is qualitative feedback, not a forecast or real customer validation.

The strongest panel signal is convenience: 17 of 20 simulated students objected to self-hosting and supplying search or AI credentials. They repeatedly asked for a phone-friendly hosted demo, current India listings, clear eligibility, and original post links. The competitor review also suggests that basic search filters are already common, while student-specific eligibility and opportunity context may still be worth testing. These are hypotheses to validate with students.

The largest risk is that the delivery model conflicts with the audience: students may not operate a server or configure provider keys. Before building more search features, interview five students and show them a no-setup mobile demo or clickable prototype. Confirm whether they would switch from existing sources for verified freshness, eligibility details, and a single application tracker.

The panel’s income inputs were translated approximately from low INR student-income assumptions because its script labels income in USD. The corrected run is in `founder/panel/`; the earlier mislabeled run is retained in `founder/panel_inr_mislabeled/` for audit and should not be cited as evidence.

Next inputs: `/founder-cfo` for costs and unit economics; `/founder-pricing` for willingness-to-pay research; `/founder-board`, `/founder-offer`, `/founder-marketing`, `/founder-brand`, `/founder-ops`, and `/founder-launch` for the remaining plan sections. The buyer panel is simulated, and the projections are not yet available. Confirm demand with real students and cost estimates. Not financial, legal, or tax advice.

## The competition

**Research snapshot:** 31 October 2026. Public product pages, app listings, help pages, and a small sample of public reviews were read. Prices and ratings change; confirm before making launch decisions. “Not verified” means no candidate-side price was confirmed in the sources reviewed. Reviews below are anecdotes, not representative survey results.

### What the market already offers

| Product | Buyer job it serves | Relevant strengths | Evidence-backed opening |
|---|---|---|---|
| [Internshala](https://play.google.com/store/apps/details?id=com.internshala.app) | Student internships and fresher jobs | India-wide, paid/unpaid options, filters for location, experience, employment mode and salary, resume builder, alerts; candidate use is free. | The app page includes a recent review describing a broken online interview link after selection. Treat as one observed incident, not a recurring failure. |
| [Unstop](https://unstop.com/) | Student career opportunities | Jobs and internships alongside competitions, hackathons, scholarships and mock interviews; strong campus context. | Recent Google Play reviews mention login/session problems, freezing/slowness, inaccurate matches, and expired listings. Sample size here is small; listing freshness and reliable filters may matter. |
| [Naukri](https://play.google.com/store/apps/details?id=naukriApp.appModules.login) | Broad India job search and recruiter discovery | Large general-market reach; profiles, job search, recruiter-facing tools and optional career services. Candidate job search is free. | Two recent Play reviews on the page report no genuine recruiter responses despite active profiles. This is a perceived outcome gap, not proof of platform-wide performance. |
| [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a6889044/) | Jobs plus professional network | AI natural-language search, filters including experience level and employment type, alerts, saved jobs, connections and hiring-team contact. | Public Play reviews include complaints about app stability/search quality; public job-seeker discussions also describe low response rates. These are self-selected reports. |
| [TechReferrals](https://techreferrals.in/about) | India tech referral and hiring posts | Human-curated posts from LinkedIn/X, structured by role, seniority, company, location, work mode and recency, with original post links. Free browsing, no account. | It already serves the referral-post discovery niche well. Its terms explicitly prohibit bulk copying or automated scraping; link out or seek permission/feed access. |
| [Cutshort](https://cutshort.io/faq) | Indian tech and product hiring | Tech-focused marketplace, salary visibility, recruiter marketplace and role-specific discovery. | Direct overlap for developers who want relevant, better-contextualized tech roles. Candidate pricing was not established in the sources reviewed. |
| [Wellfound](https://wellfound.com/candidates/overview) | Startup and tech jobs | Startup-specific marketplace; candidate profile and applications are free. | Competes for startup-seeking developers; not specifically centered on Indian student eligibility. |
| [Simplify](https://simplify.jobs/) | Job applications and productivity | Job discovery, resume tailoring, tracker, browser autofill; paid plan adds AI tailoring/autopilot functionality. Core job-seeker features are advertised as free. | Strong workflow competitor, though its positioning is broad/global rather than India student eligibility and referral context. |
| [Teal](https://help.tealhq.com/en/articles/9530153-teal-vs-teal) | Resume tailoring and application tracking | Unlimited free tracker/resume creation with a limited template/AI quota; paid tier unlocks more templates, keywords and AI credits. Teal+ listed at $13/week, $29/month, or $79/quarter. | Strong workflow competitor; not built around Indian internships, campus eligibility, referral posts, or local stipend terms. |

Other substitutes are college placement cells, alumni/senior networks, WhatsApp/Telegram groups, spreadsheets, and applying directly on employer career sites. They may provide trusted or exclusive opportunities, but the workflow is fragmented and often manual.

### Competitor feature baseline

Buyers can already expect keyword/location search, alerts, saved jobs, resume creation, application history, and—in some products—AI matching or autofill. India-specific platforms already expose filters such as experience, job type, salary, city, mode, and internships. Northstar cannot differentiate on “has filters” alone.

The more promising product test is whether it can bring these together with better **eligibility clarity**, **source/freshness trust**, and **a complete student-to-first-job workflow**: projects and coursework as evidence, internships and placement stages, stipend/salary, graduation year, referral outreach, tailored applications, and reminders.

### Price landscape (candidate-facing, evidence-limited)

- Free candidate access is common: Internshala states that applications are free; Naukri states its job-search app is free; Wellfound says candidate profiles and applications are always free; TechReferrals says search and reading are free; Simplify advertises its core job-seeker tools as free.
- Paid career add-ons are a monetization pattern, but candidate prices were not verified here for Naukri, Internshala, LinkedIn, Cutshort, or Simplify.
- Teal is the only reviewed workflow competitor with a concrete public consumer price in the sources captured: Teal+ at $13 weekly, $29 monthly, or $79 quarterly. Prices are USD and may change.
- Because the India competition offers substantial free value, a student product should prove a concrete time/trust outcome before testing a subscription. A free or low-cost student tier is a hypothesis, not a researched price recommendation.

### What public reviews suggest—and what they do not

These observations are thin: the reviewed store pages show individual low-star complaints, not a systematic sample with coded counts.

1. **Freshness and relevance (thin):** an Unstop reviewer complained that filters were inaccurate and expired listings remained visible. [Google Play review page](https://play.google.com/store/apps/details?id=com.dare2compete.app)
2. **Reliability during application (thin):** an Internshala reviewer reported that an interview link showed an invalid request after being selected. [Google Play review page](https://play.google.com/store/apps/details?id=com.internshala.app)
3. **Perceived outcomes and noisy notifications (thin):** a Naukri reviewer reported no recruiter calls and irrelevant notifications despite maintaining a profile. [Google Play review page](https://play.google.com/store/apps/details?id=naukriApp.appModules.login)
4. **Application and search usability (thin):** LinkedIn app reviewers mention search results not reflecting their query and crashes or awkward application tracking. [Google Play review page](https://play.google.com/store/apps/details?id=com.linkedin.android)

Do not treat these as measured prevalence. Validate them in interviews with actual Indian students and developers, especially whether the pain is the job source, expired postings, eligibility mismatch, application follow-up, or lack of responses.

### Positioning map

Axes: **opportunity discovery breadth** (niche → broad) and **application workflow support** (listing only → end-to-end).

- Broad discovery, limited personal application workflow: Naukri, LinkedIn.
- Student-first opportunities and activities: Internshala, Unstop.
- Tech/startup/referral niches: Cutshort, Wellfound, TechReferrals.
- Strong application workflow, broad/global discovery: Simplify, Teal, current Northstar.
- Manual and trusted but fragmented: placement cells, referral groups, spreadsheets, employer sites.

The map suggests a possible gap where Indian student-specific eligibility/referral discovery connects to careful resume tailoring and follow-up. This remains a hypothesis: Unstop and Internshala already cover parts of the student journey, while Northstar currently lacks a native India-focused, verified opportunity dataset and its self-hosted setup is unsuitable for many students.

### Recommended gap to investigate

**“Help me find roles I am actually eligible for, understand the original opportunity, and complete a thoughtful application without inventing experience.”**

That product promise would need reliable filters and normalized fields for:

- opportunity type: internship, apprenticeship, graduate/fresher, full-time, part-time, contract;
- experience and student eligibility: 0 years, fresher, graduation year, degree/branch, year of study, allowed colleges where stated;
- location and work mode: city, state, remote, hybrid, on-site, relocation;
- compensation and conditions: stipend/salary range, paid/unpaid, duration, bond/fee warning, work hours;
- trust and action: original source link, employer/career-page link, date last confirmed, deadline, report stale/scam, referral contact and preferred contact method when public;
- student workflow: project-based resume evidence, campus placement/internship stages, follow-up reminders, referral note drafts, and interview preparation.

Show “not provided” rather than guessing. Flagging scam signals should not be phrased as a guarantee that a listing is safe.

### Data-source implications

- Existing JSearch and Adzuna adapters already support India; that does not guarantee the same coverage or internship quality as local specialist platforms.
- TechReferrals states its posts are manually vetted, provides original LinkedIn/X links, and says it is a find-aid rather than a job board. Its Terms of Service forbid bulk copying and automated scraping. Do not build a crawler without explicit permission; consider an outbound link, partner feed, or user-submitted link flow.
- Unstop and Internshala are valuable user destinations, but no public API/feed permission was confirmed in this review. Prefer authorized APIs/feeds or outbound search links over scraping.
- Direct employer/ATS feeds can add structured listings, but each feed's permitted use, attribution, freshness, and cost must be checked before integration.

### Threat and strategic choice

The largest threat is not one startup: incumbent job boards can add filters, AI tailoring, and tracking, while Unstop and Internshala already have student mindshare and supply. Northstar's present technical advantage is privacy and user control, but self-hosting is a major onboarding tax for the target buyer.

Before building more features, choose whether the first product is a **hosted student-friendly service**, a **self-hosted tool for technical privacy-minded users**, or a hybrid. Then interview students in at least two situations (current student seeking internship/placement and fresher seeking first job) and working developers separately.

### Sources

- [Internshala app listing and current candidate features/pricing](https://play.google.com/store/apps/details?id=com.internshala.app); [Internshala products and services](https://internshala.com/blog/products_and_services.html)
- [Unstop](https://unstop.com/); [Unstop Google Play listing and sample reviews](https://play.google.com/store/apps/details?id=com.dare2compete.app)
- [Naukri Google Play listing, candidate pricing, and sample reviews](https://play.google.com/store/apps/details?id=naukriApp.appModules.login)
- [LinkedIn AI job search and filters](https://www.linkedin.com/help/linkedin/answer/a6889044/); [LinkedIn job alerts](https://www.linkedin.com/help/linkedin/answer/a508396); [LinkedIn Google Play listing and sample reviews](https://play.google.com/store/apps/details?id=com.linkedin.android)
- [TechReferrals About](https://techreferrals.in/about); [TechReferrals Terms](https://techreferrals.in/terms)
- [Cutshort FAQ](https://cutshort.io/faq); [Cutshort Google Play listing and sample review](https://play.google.com/store/apps/details?id=io.cutshort)
- [Wellfound candidate overview](https://wellfound.com/candidates/overview)
- [Simplify](https://simplify.jobs/); [Simplify Help Center](https://help.simplify.jobs/)
- [Teal Free vs Teal+ and pricing](https://help.tealhq.com/en/articles/9530153-teal-vs-teal)

## The buyer panel

**0 buy · 20 pass** (0% buy) out of 20 simulated buyers. Seed 419470, so the same cards can be dealt again.

These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend.

### By segment

| group | buyers | buy rate |
| --- | ---: | ---: |
| Pre-final-year student seeking a technical internship | 8 | 0% |
| Early-year student exploring internships | 6 | 0%  (thin) |
| Final-year student preparing for campus placement | 6 | 0%  (thin) |

### By buying behaviour

| group | buyers | buy rate |
| --- | ---: | ---: |
| Campus-channel checker | 5 | 0%  (thin) |
| Eligibility-first applicant | 4 | 0%  (thin) |
| High-volume applicant | 2 | 0%  (thin) |
| Self-hosting skeptic | 1 | 0%  (thin) |
| Referral seeker | 3 | 0%  (thin) |
| Project-led candidate | 3 | 0%  (thin) |
| Scam and fee cautious | 2 | 0%  (thin) |

### By income

| group | buyers | buy rate |
| --- | ---: | ---: |
| $1,000 and up | 14 | 0% |
| under $1,000 | 6 | 0%  (thin) |

### Why they pass

| reason | buyers | in their words |
| --- | ---: | --- |
| convenience | 17 | "I already check my placement cell, college groups, and LinkedIn, and I mainly need relevant openings rather than another workspace to manage. Having to provide hosting and search or AI credentials sounds like setup work I would avoid during the semester." (P001) · "I already check placement and internship links on my phone, and setting up hosting plus provider keys sounds like a project of its own. I would skip it unless it worked easily on mobile without setup." (P003) |
| trust | 2 | "I would keep checking the internship posts on the platforms I already use because this does not tell me which sources are covered or whether the listings are current and legitimate. I also do not want to configure hosting and provider keys just to try it." (P002) · "I already see openings in several places, and this does not tell me whether the listings are current, paid, or legitimate. I would rather follow the original post directly than set up another tool with hosting and credentials." (P004) |
| need | 1 | "As an early-year student, I am only exploring and can keep checking my placement group and the job sites I already know. The offer does not show whether it has the campus and off-campus opportunities I need, and setting up hosting and credentials feels like too much work for now." (P006) |

### Why they buy

| reason | buyers | in their words |
| --- | ---: | --- |

### What would flip a no

- A simple phone-friendly demo showing current, eligible internship and placement posts, with setup and provider costs clearly handled.
- A no-setup demo with current India internships, original links, and clear eligibility details.
- A simple hosted mobile-friendly version with current India listings and no credential setup.
- A phone-friendly demo showing current Indian internships with original links, stipend, and a clear freshness date.
- A simple phone-friendly hosted version that works without setup or provider keys.
- A simple demo showing current, eligible India internships and campus drives, with no setup needed.
- A ready-to-use mobile demo that shows current India roles with clear eligibility and original links.
- A simple phone-friendly demo that brings together current eligible campus and internship posts without requiring me to host it or configure keys.
- A working, phone-friendly hosted version with no setup and clear current India listings.
- A free, phone-friendly demo with guided setup and examples of project-based resumes that do not add unsupported claims.
- A phone-friendly hosted demo showing current India listings, campus drives, and the original post links.
- A simple hosted version I can use on my phone with clear setup and provider costs.

20 buyers gave all four price answers. Run founder-pricing's van_westendorp.py on the answers folder.

## Not done yet

- What the board said: run /founder-board
- Pricing: run /founder-pricing
- The offer: run /founder-offer
- The numbers: run /founder-cfo
- Marketing: run /founder-marketing
- Brand: run /founder-brand
- Operations: run /founder-ops
- Launch plan: run /founder-launch

_The panel is simulated buyers and the numbers are projections from your inputs. Confirm demand with real customers and costs with real quotes before you spend. Not financial, legal or tax advice._

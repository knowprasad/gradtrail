# GradTrail offer (working draft)

**Offer name:** The Self-Hosted Job Search Workspace

**Audience:** Students, recent graduates, and early-career developers worldwide who want one place to organize job discovery and applications, and are willing to run open-source software themselves.

**Status:** Global baseline panel completed (1/20 buys). The wording below responds to the main convenience objection with capabilities that already exist: cross-platform setup scripts, no-key search sources, and optional AI. This is a product offer for a free, self-hosted project, not a paid subscription offer.

## What users are trying to get done

Find relevant openings across configured sources, decide quickly whether to apply, prepare a credible application from limited work history, and remember every deadline and follow-up.

## Obstacles and response

| Obstacle | Response in the offer | Value (1–5) | Delivery cost (1–5) |
|---|---|---:|---:|
| Openings are scattered across job boards | Search supported sources from one workspace; source coverage remains provider-dependent | 4 | 2 |
| I cannot tell how recent a listing is | Show the source's posting date when available, and make missing dates explicit | 4 | 2 |
| I need to inspect the original job post | Preserve the original listing link | 4 | 1 |
| I miss deadlines or forget where I applied | Keep opportunity and application stages organized in one tracker | 5 | 2 |
| My experience is mostly projects and coursework | Build profile and application drafts around user-provided experience | 4 | 2 |
| AI could invent experience | Keep drafts editable and require the user to review them; never promise factual accuracy without review | 4 | 2 |
| I cannot afford another subscription | Software is free and open source; clearly disclose possible hosting, provider, and API costs | 5 | 1 |
| I do not want my application data on a third-party hosted service | Self-hosting gives the user control over where the app runs and what integrations they configure | 4 | 2 |
| Setup sounds technical | Provide the current setup guide and explain prerequisites before install | 4 | 2 |
| I have limited laptop resources | Publish measured resource guidance and keep the first-run path simple | 4 | 2 |
| I need roles in my country | Offer only supported provider/country combinations and state that coverage varies | 4 | 1 |
| I want a referral post, campus drive, or niche role | Keep original sources discoverable; do not claim exhaustive coverage | 3 | 2 |
| Job posts may be expired or misleading | Encourage checking source dates and employer links; do not label listings verified unless a verification process exists | 4 | 2 |
| I need internship or entry-level roles | Search with experience and opportunity-type filters where the source supports them | 4 | 2 |
| I need a role tailored to my location and work mode | Filter by location, remote status, and posting recency where supported | 4 | 1 |
| I do not know whether I can install it | Explain Docker and provider-key requirements up front, then test setup with real users | 5 | 2 |
| I do not want AI to submit applications without my control | Draft materials for review; application decisions and submission remain the user's | 4 | 1 |
| I already have a spreadsheet | Show a usable sample workflow and measure whether the tracker saves time before claiming it does | 3 | 2 |

Scores are qualitative estimates, not CFO cost figures; no cost model was available in the founder files.

## Offer stack

**Core:** A free, open-source, self-hosted workspace to search supported job sources, keep the original post available, and organize applications and follow-ups.

**Lower-friction first try:** The existing setup scripts for Windows, macOS, and Linux ask for the sign-in password, generate local secrets, and start the Docker app. Search can begin with public sources that need no key (FreeHire, Remote OK, and student feeds); AI is optional. Extra providers may require keys, and coverage varies. This is a truthful ease-of-start path, not a hosted no-setup trial.

**Included capabilities:**

- Search and filters for supported job sources, including location, remote, posting date, experience, and opportunity type where supported.
- Saved opportunities and an application tracker with stages and follow-up context.
- Profile and resume tools that can use coursework and projects.
- Optional AI-assisted application drafts for the user to review; requires configuring a supported provider.
- Setup documentation and source/provider configuration details.

**Bonuses:** No separate bonus is being promised. The sources, setup notes, and tracking workflow are included parts of the software, not artificially separated add-ons.

**Guarantee:** None. GradTrail is free software with no paid product or service level agreement, so a money-back guarantee would be misleading. Ask pilot users to report setup failures and record the environment so they can be fixed.

**Urgency/scarcity:** None. This is an open-source project; no artificial countdown or limited batch.

**Price and cost disclosure:** No subscription price is set. Users may incur their own hosting, API, or AI-provider costs. A free software license does not mean every connected service is free.

## Value equation (founder hypothesis, 1–10)

| Dimension | Current product | Offer framing | What changes it |
|---|---:|---:|---|
| Desired outcome | 6 | 7 | State the user outcome: find, evaluate, and follow through on opportunities in one workspace. |
| Confidence it will work | 4 | 6 | Cross-platform setup path, keyless source options, original links, and honest date gaps; a real global pilot is still needed. |
| Time to first value | 3 | 5 | Setup scripts and keyless sources reduce first-run configuration; Docker remains required. |
| Effort required | 3 | 4 | Users need Docker and must run the app, but can defer AI and keyed providers. |

The value framing cannot erase the product's self-hosted setup burden. If the global panel repeats the previous convenience objection, validate a simpler onboarding path before adding more sources or AI features.

## Retest status

The global baseline pitch produced **1 buy · 19 pass (5%)** from 20 simulated buyers (seed 419470). Sixteen of 19 passes cited convenience; common asks were a simple setup, a no-key demo, and clear coverage/costs. One simulated privacy-conscious self-hoster bought because the software was free and kept data under their control. Segment counts are small and not predictive.

The revised pitch now makes the existing cross-platform setup scripts and no-key search sources visible and says AI is optional. Six of the 20 same-seed retest answers were completed before the agent-thread limit stopped additional buyer runs. The partial panel is preserved in `founder/panel_global_offer/`, but it is not tallied or compared with the baseline. Resume the remaining 14 buyer briefs when agent capacity is available. The prior India-only panel (0/20) is not directly comparable to this global panel.

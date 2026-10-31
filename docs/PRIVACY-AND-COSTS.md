# Privacy and possible costs

GradTrail is free, open-source software that you run yourself. The app does not provide a hosted service or pay for your optional providers.

## What stays in your GradTrail database

Your profile, applications, notes, and saved postings are stored in the PostgreSQL database for your GradTrail installation. If that installation is on a server owned by someone else, its administrator has control of that server and database. Keep backups and access to `.env` secure.

## What is sent to other services

- **Job search:** GradTrail sends the keywords, location, and filters to the selected job source. A regular search does not send your profile. USAJOBS also requires the email registered to its API key.
- **Startups:** a refresh requests public YC/Hacker News and Startup.jobs feeds. The app applies profile/location matching on your GradTrail server. For up to 12 eligible leads per refresh, it may request pages from the company's own website to find published role addresses; personal addresses are only looked up when you ask. It does not send applications or messages.
- **Saved-search alerts:** daily checks are off by default. If enabled for a saved search, GradTrail repeats that search against its selected provider at most once per day, for up to five saved searches. This uses that provider's requests/quota.
- **AI drafting or scoring:** these features are optional. A local model can run on your own hardware. A hosted AI provider receives the information needed for the task you request; review that provider's terms and privacy policy.
- **Email and calendar:** Gmail and Calendar are optional integrations. Data is exchanged with Google when you connect and use them.
- **Other integrations:** each source or connector may have separate terms, quotas, and data handling. Read its details in Settings before enabling it.

For the full explanation of data handling, retention, backups, deletion, and integrations, read [`../PRIVACY.md`](../PRIVACY.md).

## What may cost money

- The GradTrail source code itself is free under AGPL-3.0.
- FreeHire, Remote OK, and student feeds can be searched without entering an API key. Public feeds and terms can change.
- Startup Jobs can also be searched without an API key; Startups refreshes public YC, Hacker News, and Startup.jobs feeds. The company-site lookups use your server's network connection.
- JSearch, Adzuna, Jooble, and USAJOBS require provider credentials. Their free quotas, paid plans, and terms can change; check the provider before use.
- Hosted AI providers may charge for use. Local AI avoids hosted-model fees but uses your own hardware and electricity.
- A remote server, domain, backups, and network traffic may cost money. Running GradTrail on your own computer avoids a server subscription but still uses your device and electricity.

AI is not required to search, save, or track applications. Start with a no-key source and add optional providers only if you want them.

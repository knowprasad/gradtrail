<p align="center">
  <img src="src/app/icon.svg" alt="" width="80" height="80">
</p>

<h1 align="center">GradTrail</h1>

<p align="center">
  An India-focused job search workspace for students and early-career developers.
</p>

This project is an India-focused adaptation of [Dossier by AienTech](https://github.com/AienTech/dossier), an open-source job search and application tracker licensed under AGPL-3.0. The interface's dark, dotted visual direction and vivid green accents take design inspiration from [Off Grid AI](https://getoffgridai.co/).

<p align="center">
  <a href="https://github.com/knowprasad/gradtrail/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/knowprasad/gradtrail/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-blue"></a>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs">
  <img alt="PostgreSQL 18" src="https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white">
</p>

GradTrail keeps your career history in one profile and turns it into a clean resume. For every job you apply to, it reads the posting, shows how you match, and drafts a tailored resume and cover letter that only use facts from your profile. You refine them in a chat, download them as PDFs and track each application from draft to offer.

It's for one person on a small server: one password, your data in your own PostgreSQL database, and an AI model of your choice. Use a local model through Ollama or LM Studio to keep your profile and documents on your own hardware, or choose a hosted model (any OpenAI-compatible API, Anthropic or Mistral). A hosted provider receives the information needed to generate your documents; [Privacy](https://github.com/AienTech/dossier/wiki/Privacy) explains what is sent.

**Get started:** [run it on your computer](#run-it-on-your-computer) in a few minutes, or [self-host it](#self-hosting) on a server. The [installation guide](https://github.com/AienTech/dossier/wiki) covers every way: Docker with or without Compose, Node.js, a plain Ubuntu server, CapRover, Coolify and Dokploy.

## Demo

![GradTrail in use: the dashboard, dragging a card on the board, a new application from a pasted posting, refining the tailored resume in the chat, the cover letter, and switching resume themes](.github/images/demo.gif)

<sub>Recorded with the demo data (Jane Doe is made up) and a stand-in AI server that answers at once, played at 1.2× speed. With a real model, reading a posting and writing the documents takes from a few seconds to a few minutes.</sub>

## Features

- **Profile:** basics, skills and languages, experience, projects, education, publications and references, in the order you choose, with a strength meter that counts only what a profile needs. Projects (side, open-source, course or thesis work) show what you can do where your job titles don't yet. Publications are cited in your own style, with bold and italics, and go on resumes word for word. Start it from an existing resume (PDF, Word or Markdown) if you like.
- **Base resume:** twelve themes and a theme builder, previewed live and printed to PDF on the server. Duplicate themes, or share them as files.
- **Find jobs:** search postings near your city, or anywhere you choose, through JSearch (LinkedIn, Indeed and more), Adzuna, FreeHire (company career pages), Jooble (including India), Remote OK, or the optional Germany-only Bundesagentur für Arbeit source. Narrow searches by experience, opportunity type (internship, apprenticeship, graduate, part-time or full-time), remote status and posting date; these are keyword hints where a source has no native filter, so check eligibility on the original post. Results show the role title and link to the original listing. Save the good ones, dismiss the rest, score any of them against your profile, and start an application from a posting with one click.
- **Startups:** startups that are hiring, from YC startups' job posts and Hacker News' monthly “Who is hiring?” thread, kept to the ones that hire where you live or remotely from your country and ranked against your profile, with the address each one publishes for applications. GradTrail reads their sites politely and follows their robots.txt. Start an application to one with a click; you decide whom to write to.
- **Job agent (optional):** once a day it runs one search for you, skips what you've seen, scores the new postings against your profile and keeps the best on the Agent screen, with its reasons. It can prepare tailored drafts too, which wait for your review. It never sends or applies.
- **New application:** paste a posting; GradTrail pulls out the details and requirements, matches them against your profile, and writes a tailored resume and cover letter in the tone you pick.
- **Never invents experience:** drafts only use facts from your profile. What the posting asks for and your profile doesn't have is shown as a gap, not made up.
- **Refine:** ask for changes in a chat, edit or regenerate any part (every part of the cover letter too: sender, date, recipient, greeting and sign-off, written in the letter's language), undo AI changes or go back to any earlier version, keep private notes.
- **Send:** an email to go with each application, to whoever the posting says to send it to, ready to copy or open in your mail app, with the resume and cover letter PDFs to attach. Edit, rewrite or refine it like the documents.
- **Claude connector (optional):** use GradTrail from Claude, on claude.ai, in the Desktop and mobile apps or in Claude's command-line app, on your own Claude plan. Claude can search for jobs, score them against your profile, read your profile and applications, and save the resume and cover letter it writes as a Draft, checked like GradTrail's own. It never sends or deletes anything. Without an AI model of GradTrail's own, **Write it with Claude** hands a posting to a new Claude chat. Turn it on in Settings → Claude connector (see [Connecting Claude](https://github.com/AienTech/dossier/wiki/Connecting-Claude)).
- **Gmail and Calendar (optional):** connect your Google account to send an application from your own address with its PDFs attached, see employers' replies next to each application, have the AI read what they ask and draft your answer from your profile, offer interview times you're free, and see your month and the week ahead on the dashboard, with interviews kept in step with Google Calendar both ways. Nothing is sent without your confirmation. Set it up by entering your Google OAuth client in Settings → Google, or with `DOSSIER_GOOGLE_CLIENT_ID` and `DOSSIER_GOOGLE_CLIENT_SECRET` (see [Connecting Gmail and Calendar](https://github.com/AienTech/dossier/wiki/Connecting-Gmail-and-Calendar)).
- **Track:** a board and a table of every application, and a dashboard with your funnel (last 30 days, 90 days or all time), a week-by-week chart, what's worth a look next, upcoming interviews included, and a calendar.
- **Your data:** export and import everything as one file, nightly backups, and Delete everything.

## Screenshots

![The dashboard: your funnel, a week-by-week chart and what's worth a look next](.github/images/dashboard.png)

<table>
  <tr>
    <td width="50%"><img src=".github/images/application.png" alt="An application with its tailored resume and the chat that refines it"><br>An application: the tailored resume, and a chat to refine it</td>
    <td width="50%"><img src=".github/images/new-application.png" alt="A new application, showing how the profile matches the posting's requirements"><br>A new application: how you match the posting</td>
  </tr>
  <tr>
    <td><img src=".github/images/applications.png" alt="The applications board, with columns from draft to offer"><br>Every application on a board, from draft to offer</td>
    <td><img src=".github/images/find-jobs.png" alt="Find jobs: postings near the profile's city, with one open"><br>Find jobs and start an application from a posting</td>
  </tr>
  <tr>
    <td><img src=".github/images/resume.png" alt="The base resume next to its themes"><br>The base resume, with twelve themes and a theme builder</td>
    <td><img src=".github/images/profile.png" alt="The profile editor, with its sections and strength meter"><br>One profile that every resume and letter comes from</td>
  </tr>
  <tr>
    <td><img src=".github/images/inbox.png" alt="The inbox: employers' replies from Gmail, what each one asks, and mail to link to an application"><br>Replies from Gmail, read by the AI, with answers it drafts</td>
    <td><img src=".github/images/calendar.png" alt="The dashboard on a wide window, with the calendar beside the cards: the month, and the week ahead with an interview among the Google Calendar's events"><br>Your interviews and Google Calendar on the dashboard, kept in step</td>
  </tr>
</table>

<sub>The screenshots show the demo data: Jane Doe is made up.</sub>

## Run it on your computer

Install [Docker Desktop](https://docs.docker.com/desktop/) on Windows or macOS, or Docker Engine with Compose on Linux, and start it. This repository currently runs from source in Docker; it does not use Dossier's published image. The guided setup asks you to choose a sign-in password, creates the required secrets, and starts the app and database. It keeps your password as a hash in the local `.env` file.

1. Download or clone this repository and open its folder in a terminal.
2. Run the setup script for your system:

   ```powershell
   .\scripts\setup.ps1
   ```

   On macOS or Linux, run `bash ./scripts/setup.sh` instead.

3. When setup finishes, open [http://localhost:3000](http://localhost:3000) and sign in with the password you chose.

The first build downloads dependencies and can take several minutes. Your profile and applications remain in the local PostgreSQL volume when you stop or restart Docker. Use `docker compose stop` to stop GradTrail and `docker compose start` to start it again. AI is optional; choose a provider later in **Settings → AI provider**. The upstream [Dossier installation guide](https://github.com/AienTech/dossier/wiki/Run-locally-with-Docker-Compose) describes Dossier's published image and deployment options.

> **Sharing this with students:** this GitHub repository is currently private. Make it public or grant students access before asking them to clone or download it.

## Self-hosting

To put this fork on a server, publish a version-tagged image with the repository's Release workflow, then use [`compose.production.yml`](compose.production.yml) and its `GRADTRAIL_*` settings. The [Dossier server guide](https://github.com/AienTech/dossier/wiki#self-host-on-a-server) has general guidance for HTTPS and reverse proxies. Give the server at least 2 vCPUs and 2 GB of memory (see [Performance and sizing](#performance-and-sizing)).

## Documentation

The [wiki](https://github.com/AienTech/dossier/wiki) has what comes after installing:

- [Choosing an AI provider](https://github.com/AienTech/dossier/wiki/Choosing-an-AI-provider): a hosted model, or a local one with Ollama or LM Studio.
- [Choosing a job source](https://github.com/AienTech/dossier/wiki/Choosing-a-job-source): JSearch, Adzuna, FreeHire, Jooble, Remote OK or the optional unofficial Germany source, and the job agent.
- [Connecting Gmail and Calendar](https://github.com/AienTech/dossier/wiki/Connecting-Gmail-and-Calendar): your own Google OAuth client, step by step.
- [Connecting Claude](https://github.com/AienTech/dossier/wiki/Connecting-Claude): the Claude connector, in Claude's apps and on the command line.
- [Backups and restore](https://github.com/AienTech/dossier/wiki/Backups-and-restore): exports, nightly backups and database dumps.
- <a name="upgrading"></a>[Upgrading](https://github.com/AienTech/dossier/wiki/Upgrading) to a new version.
- [Troubleshooting](https://github.com/AienTech/dossier/wiki/Troubleshooting): what the common errors mean, and what to do about them.
- [Privacy](https://github.com/AienTech/dossier/wiki/Privacy): what stays on your server and what leaves it. [PRIVACY.md](PRIVACY.md) has the details.
- [Environment variables](https://github.com/AienTech/dossier/wiki/Environment-variables): every setting the server reads.

## Known limitations

- **Mobile:** navigation and job discovery work on phones; profile and document editing are more comfortable on a larger screen.
- **Single user:** one password and one profile; there are no accounts.
- **English interface:** the app itself is in English. Documents can be written in other languages; in the 21 built-in ones, their headings, dates and language levels are in that language too, and in one added with **Other language…** those stay in English.
- **One instance:** run a single copy of the app per database. The nightly backups, the AI job queue and the PDF browser live inside the app's process.

## Performance and sizing

Measured on 28 September 2026 with the production build in a container limited to 2 vCPUs and 1 GB:

- **PDFs:** the base resume renders in about 0.25 s, or 1 s when Chromium has to start first (it closes after five idle minutes). Two render at a time and the rest queue: six requested at once are done in 1.4 s. GradTrail used at most about 520 MB, Chromium included, so give the container at least 768 MB.
- **Screens:** with ten times the demo data (90 applications), the dashboard and the applications list answer in 20–90 ms, and every query takes under a millisecond. With 900 applications they take up to about 0.2 s, mostly rendering; the tables are indexed for the queries they get.
- **Interactions** (changing a status, moving a card, switching tabs, opening an editor, typing, picking a theme) respond within 32 ms, and within about 100 ms on a CPU four times slower.

## Security

What protects your data, how to run GradTrail safely and how to report a problem: see [SECURITY.md](SECURITY.md).

## Development

Working on GradTrail itself: see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

GradTrail is free software under the [GNU Affero General Public License v3.0](LICENSE). You may use, change and share it; if you run a changed version for others over a network, you must offer them its source code.

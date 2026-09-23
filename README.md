# Woman's Fight AI

AI-powered social media content automation for entrepreneurs, women-led businesses,
online and local shops, coaches and creators.

**Business understanding → Business Brain → content strategy → 30-day plan → generation →
platform adaptation → your approval → scheduling → publishing → analytics.**

---

## Run it locally

```bash
npm install
cp .env.example .env.local      # optional — the app runs without any keys
npm run dev
```

Then open **http://localhost:3000**.

Create an account at `/signup`. The **first account in a fresh install becomes the admin**,
so `/admin` is reachable straight away.

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## Development mode

The app is fully explorable with **no external services configured**, and it says so
rather than pretending:

| Missing | What happens |
| --- | --- |
| Supabase | Auth and data use a local development store (`.dev-data/db.json`, salted password hashes). A banner says so. |
| `CLAUDE_API_KEY` | A clearly labelled local placeholder assistant answers instead of Claude. Every reply is marked as development output. |
| Image / video provider | Media generation is shown as a future feature and refuses rather than returning a fake asset. |
| Social platform keys | Every platform shows **Coming soon**. No connection is ever faked. |
| Stripe | Plans and limits are live and enforced; checkout says payments are not connected. |

Adding the real keys switches the same code paths over — no component changes.

---

## Connecting the real services

### Supabase

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor. It creates every table, index, enum,
   trigger and **row level security policy**, plus the `auth.users` → profile + workspace
   trigger.
3. Put the project URL, anon key and service role key into `.env.local`.

Workspace isolation is enforced by Postgres RLS, not by application code.

### Claude

Set `CLAUDE_API_KEY` (and optionally `CLAUDE_MODEL`). All AI calls go through
`lib/ai/ai-service.ts`, which validates every structured response against a Zod schema
before anything is saved.

### The publishing worker

Scheduling does not depend on a browser staying open. Point a cron job at:

```
POST /api/scheduler/run
Authorization: Bearer $SCHEDULER_WORKER_SECRET
```

every few minutes. Due jobs retry with backoff, and a post is marked **published only when
a platform API returns a post id**.

---

## Architecture

```
app/
├── (marketing)/   landing, features, pricing, faq, about, contact
├── (auth)/        login, signup, forgot/reset password, verify email
├── onboarding/    conversational Business Brain setup
├── dashboard/     dashboard, create, planner, calendar, library, social, analytics, settings
├── admin/         overview, users, subscriptions, content, usage, publishing, logs
└── api/           ai/*, scheduler/run, social/callback/*

components/   ui, marketing, auth, dashboard, ai, content, calendar, social, admin
lib/
├── ai/          AIService, BusinessBrainService, ContentStrategyService,
│                ContentGenerationService, PlatformAdaptationService, language engine
├── content/     approval, editing, scheduling rules
├── data/        DataStore interface + Supabase and development implementations
├── media/       ImageProvider / VideoProvider interfaces
├── social/      SocialProvider interface + one class per platform
├── scheduler/   SchedulerService, PublishingService
├── billing/ analytics/ notifications/ usage/ auth/ supabase/ config/ utils/
types/        the domain model, mirroring the SQL schema
supabase/     schema.sql
```

### Principles the code actually follows

- **Approval before automation.** Scheduling refuses unapproved content in the service
  layer, not just in the UI. Editing approved content sends it back for review.
- **Never claim what has not happened.** No "published" without an API confirmation, no
  "connected" without a real connection, no invented analytics.
- **One Business Brain.** The user explains their business once; every generation reads
  from it.
- **Language follows the user.** Bangla, Banglish and English are detected per message —
  there is no language selector in the chat.
- **Data belongs to a workspace.** `user → workspace → business → content`, so multiple
  brands, teams and agencies fit without a migration.
- **Secrets stay server-side.** API keys are never imported into client components, and
  logs are scrubbed of anything credential-shaped before being written.

---

## Roadmap

**Phase 2** — image generation, video generation, Facebook / Instagram / YouTube / TikTok /
X / LinkedIn publishing, real scheduler workers, subscription billing.

**Phase 3** — advanced analytics, AI performance insights, multiple businesses, team
members, agency workspaces, brand kits, content repurposing, best-time recommendations.

---

**AI does the work. You approve.**

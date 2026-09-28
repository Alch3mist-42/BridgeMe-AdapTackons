# Opportunity Bridge

Youth placements at local SMEs, with the Employment Tax Incentive worked out, the paperwork pre-filled,
and an audit-proof record of real work. Wits Social Good Hackathon 2026.

## Quick start

```bash
nvm use            # Node 22
corepack enable    # gives you pnpm
pnpm install
cp .env.example .env   # ask role D for the values
pnpm db:generate
pnpm test
pnpm dev           # http://localhost:3000
```

## Layout

| Path | What | Owner |
| --- | --- | --- |
| `apps/web` | Next.js app: pages + API routes | all |
| `apps/web/app/youth` | Youth sign-up, profile, matches | B |
| `apps/web/app/business` | SME onboarding, placements, sign-off, ETI calculator | C (calculator: A) |
| `apps/web/app/admin` | Reports, verification, audit log | D |
| `packages/incentives` | ETI rules engine + SA ID parser (tested) | A |
| `packages/documents` | Placement pack (ETI summary, checklist, PDFs) | A |
| `packages/matching` | Skill + travel-cost ranking | B |
| `packages/db` | Prisma schema, migrations, seed | D |
| `infra/` | Azure setup | D |

## Rules

- `main` is protected. Work on `feat/<area>-<thing>` branches, open a PR, one review, CI green.
- Never commit `.env`, keys or real personal data. Seed data is fictional.
- Tax maths lives in `packages/incentives` only, with tests. Never in an AI prompt.
- The AI ranks and explains; a human always decides.
- Every API route checks the user's role on the server.
- Schema changes: PR labelled `schema`, reviewed by role D.

## Scripts

`pnpm dev` · `pnpm test` · `pnpm typecheck` · `pnpm build` · `pnpm db:migrate` · `pnpm db:seed`

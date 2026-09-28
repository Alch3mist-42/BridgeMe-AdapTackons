# Sunday night: Lufuno's checklist (~45 min)

## 1. Create the GitHub repo (10 min)
1. github.com → New repository → `opportunity-bridge`, **Public** (free CodeRabbit + unlimited Actions), no README (we have one).
2. In this folder:
   ```bash
   git init -b main
   git add .
   git commit -m "chore: scaffold monorepo"
   git remote add origin https://github.com/<you>/opportunity-bridge.git
   git push -u origin main
   ```
3. Settings → Collaborators → invite the 3 teammates (Write access).

## 2. Protect main (5 min)
Settings → Branches → Add rule for `main`:
- Require a pull request before merging, 1 approval
- Require status checks: `test` (appears after the first CI run)
- Block force pushes

## 3. Roles (10 min, team call)
- Everyone reads "Phase 1 roles" in the build plan doc and writes their name in the table.
- Replace `@ROLE_A`…`@ROLE_D` in `.github/CODEOWNERS` with GitHub usernames.

## 4. Agree the schema (15 min, team call)
- Walk through `packages/db/prisma/schema.prisma` together. It covers:
  User, YouthProfile, Business, Placement, Application, Engagement,
  TimesheetEntry, IncentiveCalc, Consent, Report, AuditLog.
- Changes tonight are free. From Monday, schema changes go through role D.

## 5. Everyone, tonight
- [ ] Claim the GitHub Student Developer Pack (free Copilot).
- [ ] Clone, `pnpm install`, `pnpm test` passes (32 tests).
- [ ] Hand Azure setup to role D: `infra/AZURE-SETUP.md` (first job Monday morning).

First migration (role D, Monday morning, once DATABASE_URL points at Azure):

1. In Azure Portal → your PostgreSQL server → Server parameters → `azure.extensions` → allow `VECTOR`.
2. `pnpm db:migrate --name init`
3. `pnpm db:seed`

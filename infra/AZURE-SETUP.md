# Azure setup (role D, Monday morning, ~40 min)

Install the Azure CLI and run `az login`. Replace `<suffix>` with something unique, e.g. your initials + 3 digits.
Region: `southafricanorth` (low latency, data stays in SA for POPIA). If your subscription blocks it, use `westeurope`.

```bash
RG=rg-opportunity-bridge
LOC=southafricanorth
DB=ob-db-<suffix>
APP=ob-web-<suffix>
PW='<strong-password>'

az group create -n $RG -l $LOC

# PostgreSQL Flexible Server, cheapest tier
az postgres flexible-server create -g $RG -n $DB -l $LOC \
  --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --admin-user obadmin --admin-password "$PW" --public-access 0.0.0.0
az postgres flexible-server parameter set -g $RG --server-name $DB --name azure.extensions --value VECTOR
az postgres flexible-server db create -g $RG -s $DB -d opportunity_bridge

# App Service (Linux, Node 22)
az appservice plan create -g $RG -n ob-plan --is-linux --sku B1
az webapp create -g $RG -p ob-plan -n $APP --runtime "NODE:22-lts"
az webapp config set -g $RG -n $APP --startup-file "node apps/web/server.js"
az webapp config appsettings set -g $RG -n $APP --settings \
  DATABASE_URL="postgresql://obadmin:$PW@$DB.postgres.database.azure.com:5432/opportunity_bridge?sslmode=require" \
  AUTH_SECRET="$(openssl rand -base64 32)" HOSTNAME=0.0.0.0
az webapp config set -g $RG -n $APP --generic-configurations '{"healthCheckPath": "/api/health"}'
```

## Connect GitHub deploys
```bash
# allow publish-profile deploys
az resource update -g $RG --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies \
  --parent sites/$APP -n scm --set properties.allow=true
az webapp deployment list-publishing-profiles -g $RG -n $APP --xml > profile.xml
```
GitHub repo → Settings → Secrets and variables → Actions:
- Secret `AZURE_WEBAPP_PUBLISH_PROFILE` = contents of `profile.xml` (then delete the file)
- Variable `AZURE_WEBAPP_NAME` = `$APP`

Push to `main` → the Deploy workflow runs → check `https://$APP.azurewebsites.net/api/health`.

## Later in the week
- Azure OpenAI: create a resource, deploy `text-embedding-3-small`, add endpoint + key as app settings (role B).
- Storage account + private container `evidence` (role C).
- Azure Maps account (role B).
- Cost guard: Portal → Cost Management → Budgets → alert at 50% of credit.

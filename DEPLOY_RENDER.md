INSPEC360 — Deploy on Render (Free tier)

This guide walks you through pushing the repository to GitHub and deploying both backend and frontend on Render.

1) Prepare the repository locally (one-time)

- Initialize git (if needed), add remote and push. Replace <YOUR-REMOTE-URL> with the URL of the GitHub repository you created (https://github.com/inspec360valeverde-ux/INSPEC360.15-07-26.git):

```powershell
cd "C:\inspec360 v2.1"
# initialize if repo not present
git init
git add -A
git commit -m "Initial import: INSPEC360 v2.1"
# if you prefer SSH use the SSH URL, e.g. git@github.com:user/repo.git
# To push using a GitHub Personal Access Token (PAT) safely, use the gh CLI auth or configure a remote without embedding the token in history
# Option A (recommended): authenticate with GitHub CLI and push
#   1. Install and login: https://cli.github.com/
#   2. Run: gh auth login
#   3. Then:
git remote add origin https://github.com/inspec360valeverde-ux/INSPEC360.15-07-26.git
git branch -M main
git push -u origin main

# Option B (if you must use a temporary PAT):
# DO NOT embed token in a commit. Use the URL only for the push command and then unset remote URL.
# Example (PowerShell):
# $env:GITHUB_PAT = Read-Host -AsSecureString "Enter PAT" | ConvertFrom-SecureString
# git remote add origin https://<USERNAME>:<PAT>@github.com/inspec360valeverde-ux/INSPEC360.15-07-26.git
# git push -u origin main
# git remote set-url origin https://github.com/inspec360valeverde-ux/INSPEC360.15-07-26.git
```

Notes:
- Prefer using `gh auth login` or SSH keys. Do not paste PAT into files.
- If your repo already contains a remote, set the URL: `git remote set-url origin <url>`.

2) Render: create services (UI flow)

Option A — Quick (Render Dashboard):
- Sign in to https://render.com
- Click "New+" → "Web Service" → Choose "Connect a repository". Select your GitHub repo.
- For the Backend service, set:
  - Name: `inspec360-backend`
  - Environment: `Node`
  - Branch: `main`
  - Build Command: `cd backend && pnpm install --frozen-lockfile || npm install`
  - Start Command: `cd backend && pnpm start || npm start`
  - Environment Variables: set `DATABASE_URL` later (see DB creation)
- Create a second service: "Static Site"
  - Name: `inspec360-frontend`
  - Branch: `main`
  - Build Command: `pnpm install --frozen-lockfile || npm install && pnpm build || npm run build`
  - Publish Directory: `dist`

- Create a managed Postgres DB via Render Dashboard: New+ → Database → Postgres
  - Name: `inspec360-db` (or choose any name)
  - Plan: Starter (free tier)
  - Region: your preferred region
- After DB is created, copy the connection string and set it as `DATABASE_URL` in the Backend service's environment variables. If Render links DB to service, it may auto-populate.

Option B — Using `render.yaml` (in repo root)
- The repository already contains `render.yaml`. In the Render dashboard choose "New → Import from Git" and follow the steps; Render will detect `render.yaml` and offer to create resources.
- Review the generated services and confirm environment variables and DB linking.

3) Backend specific setup

- Your backend expects `DATABASE_URL` pointing to a Postgres instance. Example format:

```
postgres://user:password@host:5432/dbname
```

- If you created a managed DB on Render, set that connection string in the Backend service's env var `DATABASE_URL`.
- Run DB initialization (if required): Render provides a console for the service — use it to run migrations/initialization.

Example (Render Shell):
```bash
# Open Shell for the backend service in Render dashboard
cd /opt/render/project/src
node src/database/init-postgres.js
```

4) Environment variables and secrets

- On Render set these env vars for the backend (at minimum):
  - `DATABASE_URL` — connection string to Postgres
  - `NODE_ENV=production`
  - Any other app-specific secrets used in your repo

5) Test & post-deploy checks

- Frontend: the static site will be served automatically. Visit the frontend URL provided by Render.
- Backend: verify endpoints under the backend service URL (`/api/...`).
- In the app, point the frontend API client to the backend URL (update `src/api/client.js` or environment override if needed). You can set an env var for the frontend build: `VITE_API_BASE_URL` and use it in your client.

6) Helpful commands for local testing before push

```powershell
# run backend locally
cd backend
pnpm install
pnpm start

# run frontend locally
cd ..
pnpm install
pnpm dev
```

7) If you want, I can:
- Prepare a small `.github/workflows/render-deploy.yml` or CI file to automate push-to-deploy.
- Create a `Procfile` or tweak `start` scripts if Render needs different commands.

---
If you want, I can now:
- (A) Prepare a safe git push script that uses `gh auth login` for you to run locally, or
- (B) attempt to push from this environment if you provide an authenticated remote (SSH key or PAT). 

Which option do you prefer?
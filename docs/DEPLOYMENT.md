# Deployment Guide — AfriCraft Rwanda

## Overview

| Service | Platform | URL (after deploy) |
|---|---|---|
| Database | MongoDB Atlas (free M0) | — |
| Backend API | Render Web Service | https://africraft-api.onrender.com |
| Frontend | Render Static Site | https://africraft-web.onrender.com |

---

## Step 1 — MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and sign up / log in.
2. Create a **free M0 cluster** (choose any region).
3. Under **Database Access** → Add a database user:
   - Username: `africraft`
   - Password: generate a strong password, copy it
4. Under **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`)
5. Click **Connect** on your cluster → **Drivers** → copy the connection string:
   ```
   mongodb+srv://africraft:<password>@cluster0.xxxxx.mongodb.net/africraft-rwanda?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

## Step 2 — Deploy Backend on Render

1. Go to https://render.com and sign up / log in with GitHub.
2. Click **New → Web Service**.
3. Connect your GitHub repo (`africraft-rwanda`).
4. Configure:
   - **Name**: `africraft-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | *(your Atlas connection string)* |
   | `JWT_SECRET` | *(any long random string, e.g. `africraft-secret-2026`)* |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | *(leave blank for now, update after frontend deploy)* |
6. Click **Create Web Service**.
7. Wait for deploy — copy the URL: `https://africraft-api.onrender.com`
8. Test: visit `https://africraft-api.onrender.com/health` — should return `{"ok":true}`

---

## Step 3 — Seed the Database

After the backend is live, seed products via your local machine:

```bash
$env:MONGODB_URI="mongodb+srv://africraft:<password>@cluster0.xxxxx.mongodb.net/africraft-rwanda?retryWrites=true&w=majority"
npm run seed:products
```

---

## Step 4 — Deploy Frontend on Render

1. On Render, click **New → Static Site**.
2. Connect the same GitHub repo.
3. Configure:
   - **Name**: `africraft-web`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://africraft-api.onrender.com` |
5. Under **Redirects/Rewrites**, add:
   - Source: `/*` → Destination: `/index.html` → Action: Rewrite
6. Click **Create Static Site**.
7. Wait for deploy — copy the URL: `https://africraft-web.onrender.com`

---

## Step 5 — Update CORS on Backend

Go back to your backend service on Render → **Environment** → update:
```
CLIENT_URL = https://africraft-web.onrender.com
```
Then click **Manual Deploy → Deploy latest commit**.

---

## Step 6 — Update README

Update the live links table in `README.md`:
```
| Live Application | https://africraft-web.onrender.com |
| API Health       | https://africraft-api.onrender.com/health |
```

---

## Notes

- Render free tier spins down after 15 minutes of inactivity — first request may take ~30 seconds.
- MongoDB Atlas M0 free tier supports up to 512MB storage — more than enough.
- All environment variables are set in the Render dashboard, never committed to Git.

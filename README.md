# Job Hunt OS

A **monolithic MERN application tracker** for active job seekers: kanban pipeline, funnel insights, AI-powered job-description fit scoring, and automatic follow-up reminders.

Built to be one simple deploy: the React client is built and served by the same Express server that powers the API.

## Features

- **Kanban board** — drag cards between Applied / Interviewing / Offer / Rejected; search; inline add/edit/delete
- **Insights** — pipeline funnel, response & interview rates, average days in pipeline, and a "needs follow-up" list (Applied > 7 days)
- **Fit Checker** — paste any job description and get a 0–100 fit score against your skills, with matched strengths and missing keywords. Uses AI (OpenAI-compatible API) when configured, with a dependency-free keyword matcher as fallback
- **Resume → AI skills** — upload your resume (PDF / DOCX / TXT) and AI reads it and auto-adds the skills it finds. Manual skill editing always stays available; without an API key a keyword matcher is used
- **Follow-up reminders** — a daily cron digests stale applications; emails them via SMTP when configured, otherwise logs to the console
- **CSV export** — download every application as `job-hunt-os.csv`
- **Single-user auth** — email + password, JWT session

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18 + Vite (no router — simple tab shell) |
| Backend | Node.js + Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JSON Web Tokens (jsonwebtoken + bcryptjs) |
| File upload | multer (in-memory) |
| Resume parsing | pdf-parse (PDF), mammoth (DOCX) |
| Jobs | node-cron + nodemailer |
| Fit scoring | fetch against OpenAI-compatible chat endpoint, keyword fallback |

## Quick start

Requirements: Node.js 18+.

```bash
npm run install:all     # install root + client deps
npm run dev             # server on :5000, Vite client on :5173 (proxy /api)
```

Open http://localhost:5173, create an account, and start adding applications.

### Database

If `MONGODB_URI` is set it is used (local MongoDB or MongoDB Atlas). If it is unset **or unreachable**, the server automatically starts an ephemeral **in-memory MongoDB** (`mongodb-memory-server`) — great for a zero-config demo. Data is wiped on restart; use a real MongoDB for anything you want to keep.

### Production (single server)

```bash
npm run build   # builds client into client/dist
npm start       # builds + serves client and API from one Express server
```

The API serves on `PORT` (default 5000) and the SPA from the same origin, so there is no CORS setup and a single process to deploy (Render, Railway, Fly, a VM, etc.).

> **Note:** the in-memory fallback is for local demos only. If `MONGODB_URI` is set in production (`NODE_ENV=production`), the server fails hard instead of silently falling back to an ephemeral database.

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Lux010/job-hunt-os)

1. Click the button and sign in to Render with GitHub (free).
2. When prompted, set **`MONGODB_URI`** to your MongoDB Atlas connection string.
3. Render auto-generates `JWT_SECRET`, builds the client, and starts the server.

`render.yaml` is the deploy blueprint: build runs `npm install` + client build; the start command serves the SPA and API from one process; `/api/health` is the health check.

### MongoDB Atlas (free)

1. Sign up at https://www.mongodb.com/cloud/atlas/register2 and create a **free (M0) cluster** — pick a region near your host (e.g. `us-east-1`).
2. **Database Access** → Add new database user (e.g. `jobhunt`) with a password.
3. **Network Access** → Add IP address → **Allow access from anywhere** (`0.0.0.0/0`) so Render can reach it.
4. **Database** → Connect → Drivers → copy the connection string (`mongodb+srv://...`) and replace `<password>` with the user's password.
5. Paste it as `MONGODB_URI` in the Render deploy step above.

> Your data lives on Atlas; deployments and restarts never wipe it.

## Configuration (`.env`)

Copy `.env.example` to `.env` and adjust:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `5000` |
| `MONGODB_URI` | MongoDB connection string (local/Atlas) | in-memory fallback |
| `JWT_SECRET` | Signing secret for sessions | `dev-secret-change-me` |
| `OPENAI_API_KEY` | Enables AI fit scoring | off (keyword matcher) |
| `OPENAI_BASE_URL` / `OPENAI_MODEL` | Endpoint + model | OpenAI / `gpt-4o-mini` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Follow-up digest email | off (log only) |
| `REMINDER_CRON` | Digest schedule | `0 9 * * *` |
| `REMINDER_AFTER_DAYS` | Staleness threshold | `7` |

> **Gmail:** use an [App Password](https://support.google.com/accounts/answer/185833) and `SMTP_PORT=465`.

## Project layout

```
job-hunt-os/
├── client/            # React + Vite SPA
│   └── src/
│       ├── components/  Auth, Board, JobModal, Dashboard, FitChecker, Settings
│       └── api.js       fetch wrapper + auth token
├── server/
│   ├── index.js         Express app, serves client/dist in production
│   ├── db.js            Mongo connect with in-memory fallback
│   ├── models/          User, Job
│   ├── routes/          auth, user, jobs, stats, score, csv, resume
│   ├── middleware/      JWT auth
│   └── services/        fit.js (AI/keyword scoring), reminders.js (cron + email), resume.js (PDF/DOCX/TXT text), skillExtract.js (AI/keyword skills)
└── .env.example
```

## License

MIT

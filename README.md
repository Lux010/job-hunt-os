# Job Hunt OS

A **monolithic MERN application tracker** for active job seekers: kanban pipeline, funnel insights, AI-powered job-description fit scoring, and automatic follow-up reminders.

Built to be one simple deploy: the React client is built and served by the same Express server that powers the API.

## Features

- **Kanban board** — drag cards between Applied / Interviewing / Offer / Rejected; search; inline add/edit/delete
- **Insights** — pipeline funnel, response & interview rates, average days in pipeline, and a "needs follow-up" list (Applied > 7 days)
- **Fit Checker** — paste any job description and get a 0–100 fit score against your skills, with matched strengths and missing keywords. Uses AI (OpenAI-compatible API) when configured, with a dependency-free keyword matcher as fallback
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
│   ├── routes/          auth, user, jobs, stats, score, csv
│   ├── middleware/      JWT auth
│   └── services/        fit.js (AI/keyword scoring), reminders.js (cron + email)
└── .env.example
```

## License

MIT

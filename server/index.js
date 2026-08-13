import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import express from 'express';
import cors from 'cors';

import { connectDB, closeDB } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import jobRoutes from './routes/jobs.js';
import statRoutes from './routes/stats.js';
import scoreRoutes from './routes/score.js';
import csvRoutes from './routes/csv.js';
import resumeRoutes from './routes/resume.js';
import { startReminders } from './services/reminders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api/resume', resumeRoutes);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production' && existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) =>
    res.send('Job Hunt OS API is running. Start the client with `npm run dev`.')
  );
}

await connectDB();
startReminders();
app.listen(PORT, () => console.log(`[server] Job Hunt OS listening on http://localhost:${PORT}`));

const shutdown = async () => {
  await closeDB();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

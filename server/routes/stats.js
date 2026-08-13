import express from 'express';
import { Job, STATUSES } from '../models/Job.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  const jobs = await Job.find({ user: req.userId });
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
  for (const j of jobs) counts[j.status] = (counts[j.status] || 0) + 1;

  const active = jobs.filter(j => j.status !== 'Rejected');
  const avgDays = active.length
    ? Math.round(active.reduce((sum, j) => sum + (Date.now() - new Date(j.appliedAt).getTime()) / 86400000, 0) / active.length)
    : 0;
  const oldest = active.length ? Math.min(...active.map(j => new Date(j.appliedAt).getTime())) : null;

  const responseRate = jobs.length
    ? Math.round(((counts.Interviewing + counts.Offer + counts.Rejected) / jobs.length) * 100)
    : 0;

  const interviewRate = counts.Applied + counts.Interviewing
    ? Math.round((counts.Interviewing / (counts.Applied + counts.Interviewing)) * 100)
    : 0;

  res.json({
    total: jobs.length,
    counts,
    active: active.length,
    avgDaysSinceApplied: avgDays,
    oldestApplied: oldest ? new Date(oldest) : null,
    responseRate,
    interviewRate,
    byStatus: STATUSES.map(s => ({ status: s, count: counts[s] }))
  });
});

export default router;

import express from 'express';
import { Job } from '../models/Job.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

router.get('/export.csv', async (req, res) => {
  const jobs = await Job.find({ user: req.userId }).sort({ appliedAt: -1 });
  const escape = v => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const header = ['title', 'company', 'status', 'location', 'salary', 'appliedAt', 'deadline', 'url', 'notes'];
  const rows = jobs.map(j => [
    escape(j.title), escape(j.company), escape(j.status), escape(j.location),
    escape(j.salary), escape(j.appliedAt ? j.appliedAt.toISOString().slice(0, 10) : ''),
    escape(j.deadline ? j.deadline.toISOString().slice(0, 10) : ''),
    escape(j.url), escape(j.notes)
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="job-hunt-os.csv"');
  res.send(csv);
});

export default router;

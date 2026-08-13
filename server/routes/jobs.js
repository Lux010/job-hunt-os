import express from 'express';
import { Job, STATUSES } from '../models/Job.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

const FIELDS = ['title', 'company', 'url', 'location', 'salary', 'deadline', 'notes', 'nextFollowUp', 'contacted'];

function parseBody(body) {
  const data = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  if (body.status !== undefined) {
    data.status = STATUSES.includes(body.status) ? body.status : 'Applied';
  }
  if (body.appliedAt !== undefined && body.appliedAt) data.appliedAt = new Date(body.appliedAt);
  if (data.deadline) data.deadline = new Date(data.deadline);
  if (data.nextFollowUp) data.nextFollowUp = new Date(data.nextFollowUp);
  return data;
}

router.get('/', async (req, res) => {
  const jobs = await Job.find({ user: req.userId }).sort({ appliedAt: -1 });
  res.json(jobs);
});

router.post('/', async (req, res) => {
  try {
    const data = parseBody(req.body);
    if (!data.title || !data.company) return res.status(400).json({ error: 'Title and company are required' });
    const job = await Job.create({ user: req.userId, ...data });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: 'Could not create job' });
  }
});

router.put('/:id', async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: parseBody(req.body) },
    { new: true }
  );
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

router.delete('/:id', async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ ok: true });
});

export default router;

import express from 'express';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { scoreFit } from '../services/fit.js';

const router = express.Router();

router.use(authRequired);

router.post('/', async (req, res) => {
  const jd = String(req.body.jobDescription || '').trim();
  if (jd.length < 20) return res.status(400).json({ error: 'Paste a longer job description (20+ characters)' });
  const user = await User.findById(req.userId);
  const result = await scoreFit(jd, user.skills);
  res.json(result);
});

export default router;

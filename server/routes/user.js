import express from 'express';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user._id, email: user.email, skills: user.skills, createdAt: user.createdAt });
});

router.put('/skills', authRequired, async (req, res) => {
  const raw = req.body.skills;
  if (!Array.isArray(raw)) return res.status(400).json({ error: 'skills must be an array' });
  const skills = raw.map(s => String(s).trim()).filter(Boolean);
  const user = await User.findByIdAndUpdate(req.userId, { skills }, { new: true });
  res.json({ skills: user.skills });
});

export default router;

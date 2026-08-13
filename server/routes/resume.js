import express from 'express';
import multer from 'multer';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';
import { extractText } from '../services/resume.js';
import { extractSkillsFromText, mergeSkills } from '../services/skillExtract.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }
});

router.post('/upload', authRequired, (req, res) => {
  upload.single('resume')(req, res, async err => {
    if (err) {
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'Attach a resume file (PDF, DOCX or TXT).' });
    try {
      const { text, kind } = await extractText(req.file.originalname, req.file.buffer);
      const { skills: found, source } = await extractSkillsFromText(text);
      const user = await User.findById(req.userId);
      const { skills, added } = mergeSkills(user.skills || [], found);
      user.skills = skills;
      await user.save();
      res.json({ skills, added, source, kind, chars: text.length, foundCount: found.length });
    } catch (e) {
      const status = e.status || 500;
      res.status(status).json({ error: e.message });
    }
  });
});

export default router;

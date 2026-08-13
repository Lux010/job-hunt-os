import mongoose from 'mongoose';

const DEFAULT_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Redux', 'Tailwind CSS',
  'Node.js', 'Express', 'REST API', 'Python', 'Django', 'Flask', 'PHP',
  'MySQL', 'PostgreSQL', 'MongoDB', 'SQL Optimization',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Nginx', 'Redis',
  'CI/CD', 'Git', 'Jest', 'Web Scraping', 'API Integration', 'Agile'
];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  skills: { type: [String], default: DEFAULT_SKILLS },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);

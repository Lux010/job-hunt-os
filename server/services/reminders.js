import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';

function buildDigest(jobs) {
  const lines = jobs.map(j => {
    const days = Math.round((Date.now() - new Date(j.appliedAt).getTime()) / 86400000);
    return `- ${j.title} @ ${j.company} (applied ${days} days ago)${j.url ? ' - ' + j.url : ''}`;
  });
  return [
    'Here are your applications that have been sitting in "Applied" for a while:',
    '',
    ...lines,
    '',
    'Time to follow up - or move them forward.',
    '- Job Hunt OS'
  ].join('\n');
}

async function runReminder() {
  const afterDays = Number(process.env.REMINDER_AFTER_DAYS) || 7;
  const since = new Date(Date.now() - afterDays * 86400000);
  const stale = await Job.find({ status: 'Applied', appliedAt: { $lte: since } }).populate('user');
  if (!stale.length) {
    console.log('[reminder] no stale applications to remind about.');
    return;
  }

  const byUser = new Map();
  for (const job of stale) {
    if (!byUser.has(job.user.email)) byUser.set(job.user.email, []);
    byUser.get(job.user.email).push(job);
  }

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    for (const [email, jobs] of byUser) {
      console.log('[reminder] digest for ' + email + ':\n' + buildDigest(jobs));
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  for (const [email, jobs] of byUser) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Job Hunt OS — ${jobs.length} application${jobs.length > 1 ? 's' : ''} need a follow-up`,
      text: buildDigest(jobs)
    });
    console.log('[reminder] sent digest to ' + email);
  }
}

export function startReminders() {
  const cronExpr = process.env.REMINDER_CRON || '0 9 * * *';
  if (!cron.validate(cronExpr)) {
    console.warn('[reminder] invalid REMINDER_CRON, disabling scheduled reminders.');
    return;
  }
  cron.schedule(cronExpr, () => {
    runReminder().catch(err => console.error('[reminder] failed:', err.message));
  });
  console.log('[reminder] scheduled (' + cronExpr + ')');
}

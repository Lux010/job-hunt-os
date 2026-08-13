import React, { useState } from 'react';
import { api } from '../api.js';

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

export default function JobModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: job?.title || '',
    company: job?.company || '',
    url: job?.url || '',
    location: job?.location || '',
    salary: job?.salary || '',
    deadline: job?.deadline ? String(job.deadline).slice(0, 10) : '',
    status: job?.status || 'Applied',
    notes: job?.notes || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) {
      setError('Title and company are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = {
        ...form,
        title: form.title.trim(),
        company: form.company.trim(),
        deadline: form.deadline || undefined
      };
      if (job) {
        await api('/jobs/' + job._id, { method: 'PUT', body });
      } else {
        await api('/jobs', { method: 'POST', body });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{job ? 'Edit application' : 'Add application'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="m-title">Job title *</label>
            <input id="m-title" value={form.title} onChange={set('title')} placeholder="Senior React Developer" required />
          </div>
          <div className="field">
            <label htmlFor="m-company">Company *</label>
            <input id="m-company" value={form.company} onChange={set('company')} placeholder="Acme Inc" required />
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="m-location">Location</label>
              <input id="m-location" value={form.location} onChange={set('location')} placeholder="Remote / Cape Town" />
            </div>
            <div className="field">
              <label htmlFor="m-salary">Salary</label>
              <input id="m-salary" value={form.salary} onChange={set('salary')} placeholder="R80 000 / month" />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="m-url">Posting URL</label>
              <input id="m-url" type="url" value={form.url} onChange={set('url')} placeholder="https://…" />
            </div>
            <div className="field">
              <label htmlFor="m-deadline">Deadline</label>
              <input id="m-deadline" type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="m-status">Status</label>
            <select id="m-status" value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="m-notes">Notes</label>
            <textarea id="m-notes" rows="3" value={form.notes} onChange={set('notes')} placeholder="Recruiter name, tech stack, next steps…"></textarea>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-grad" disabled={busy}>
              {busy ? 'Saving…' : job ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

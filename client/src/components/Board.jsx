import React, { useState } from 'react';
import { api } from '../api.js';
import JobModal from './JobModal.jsx';

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
const STATUS_COLORS = {
  Applied: '#38bdf8',
  Interviewing: '#818cf8',
  Offer: '#34d399',
  Rejected: '#f87171'
};

function daysClass(job) {
  const days = (Date.now() - new Date(job.appliedAt).getTime()) / 86400000;
  if (job.status !== 'Applied') return '';
  if (days >= 7) return 'days over';
  if (days >= 3) return 'days hot';
  return 'days';
}

export default function Board({ jobs, refresh }) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const filtered = jobs.filter(j =>
    (j.title + ' ' + j.company).toLowerCase().includes(query.toLowerCase())
  );

  async function moveStatus(job, status) {
    try {
      await api('/jobs/' + job._id, { method: 'PUT', body: { status } });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeJob(job) {
    if (!confirm('Delete "' + job.title + '" from ' + job.company + '?')) return;
    try {
      await api('/jobs/' + job._id, { method: 'DELETE' });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  function onDrop(status) {
    if (!dragId) return;
    const job = jobs.find(j => j._id === dragId);
    if (job && job.status !== status) moveStatus(job, status);
    setDragId(null);
    setOverCol(null);
  }

  return (
    <div>
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Board <span>— drag cards to update status</span></h2>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          <div className="search">
            <input
              type="search"
              placeholder="Search title or company…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-grad" onClick={() => { setEditing(null); setShowModal(true); }}>
            + Add application
          </button>
        </div>
      </div>

      <div className="board">
        {STATUSES.map(status => {
          const colJobs = filtered.filter(j => j.status === status);
          return (
            <div
              className={'col' + (overCol === status ? ' drag-over' : '')}
              key={status}
              onDragOver={e => { e.preventDefault(); setOverCol(status); }}
              onDragLeave={() => setOverCol(prev => (prev === status ? null : prev))}
              onDrop={e => { e.preventDefault(); onDrop(status); }}
            >
              <div className="col-head">
                <span className="name">
                  <span className="dot" style={{ background: STATUS_COLORS[status] }}></span>
                  {status}
                </span>
                <span className="count">{colJobs.length}</span>
              </div>
              {colJobs.map(job => {
                const days = Math.round((Date.now() - new Date(job.appliedAt).getTime()) / 86400000);
                return (
                  <div
                    className={'job-card' + (dragId === job._id ? ' dragging' : '')}
                    key={job._id}
                    draggable
                    onDragStart={() => setDragId(job._id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  >
                    <div className="t">{job.title}</div>
                    <div className="c">{job.company}</div>
                    <div className="meta">
                      {job.location && <span className="pill">📍 {job.location}</span>}
                      <span className={daysClass(job)}>{days}d</span>
                      {job.deadline && (
                        <span className="pill">
                          ⏳ {new Date(job.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="acts">
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <button type="button">Open</button>
                        </a>
                      )}
                      <button type="button" onClick={() => { setEditing(job); setShowModal(true); }}>Edit</button>
                      <button type="button" className="danger" onClick={() => removeJob(job)}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {colJobs.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: '.78rem', textAlign: 'center', marginTop: '1rem' }}>
                  Drop cards here
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <JobModal
          job={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); refresh(); }}
        />
      )}
    </div>
  );
}

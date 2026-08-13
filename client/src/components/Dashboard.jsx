import React from 'react';

const STATUS_COLORS = {
  Applied: '#38bdf8',
  Interviewing: '#818cf8',
  Offer: '#34d399',
  Rejected: '#f87171'
};

export default function Dashboard({ stats, jobs }) {
  const s = stats || { total: 0, counts: {}, responseRate: 0, interviewRate: 0, avgDaysSinceApplied: 0, byStatus: [] };
  const total = s.total || 0;
  const maxCount = Math.max(1, ...(s.byStatus || []).map(b => b.count));
  const stale = jobs.filter(j => {
    if (j.status !== 'Applied') return false;
    const days = (Date.now() - new Date(j.appliedAt).getTime()) / 86400000;
    return days >= 7;
  });
  const recent = [...jobs]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 6);

  return (
    <div>
      <h2 className="section-title">Insights <span>— how your pipeline is moving</span></h2>
      <div className="stats-grid">
        <div className="stat-card"><div className="num">{total}</div><div className="lbl">Total applications</div></div>
        <div className="stat-card"><div className="num">{s.counts.Interviewing || 0}</div><div className="lbl">Interviews</div></div>
        <div className="stat-card"><div className="num">{s.counts.Offer || 0}</div><div className="lbl">Offers</div></div>
        <div className="stat-card"><div className="num">{s.responseRate}%</div><div className="lbl">Response rate</div></div>
        <div className="stat-card"><div className="num">{s.avgDaysSinceApplied || 0}</div><div className="lbl">Avg days in pipeline</div></div>
        <div className="stat-card"><div className="num">{stale.length}</div><div className="lbl">Awaiting follow-up</div></div>
      </div>

      <div className="panel">
        <h3>Pipeline funnel</h3>
        <div className="funnel">
          {(s.byStatus || []).map(b => (
            <div className="funnel-col" key={b.status}>
              <span className="val">{b.count}</span>
              <div
                className={'bar' + (b.count === 0 ? ' zero' : '')}
                style={{ height: Math.max(3, (b.count / maxCount) * 100) + '%', background: STATUS_COLORS[b.status] }}
              ></div>
              <span className="lbl">{b.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Need a follow-up (Applied &gt; 7 days)</h3>
        {stale.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.86rem' }}>Nothing stale. Nice work staying on top of things.</p>
        ) : (
          <div className="trend-list">
            {stale.map(j => (
              <div className="trend-item" key={j._id}>
                <span>{j.title} <span style={{ color: 'var(--muted)' }}>@ {j.company}</span></span>
                <b>{Math.round((Date.now() - new Date(j.appliedAt).getTime()) / 86400000)}d</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h3>Recently added</h3>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.86rem' }}>No applications yet — add one from the Board tab.</p>
        ) : (
          <div className="trend-list">
            {recent.map(j => (
              <div className="trend-item" key={j._id}>
                <span>{j.title} <span style={{ color: 'var(--muted)' }}>@ {j.company}</span></span>
                <b>{new Date(j.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
